import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef,
  NgZone,
} from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { PaymentService } from "@service/payment.service";
import { NotificationService } from "@service/shared/notifcation.service";
import {
  ChargeCalculationService,
  ChargeScheme,
} from "@service/charge-calculation.service";
import { Subject, takeUntil } from "rxjs";

@Component({
  selector: "app-cib-payment",
  templateUrl: "./cib-payment.component.html",
  styleUrls: ["./cib-payment.component.scss"],
})
export class CibPaymentComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() currentMeter!: any;
  @Input() currentMeterInfo!: any;
  @Input() chargeScheme: ChargeScheme | null = null;

  @Output() chargeAmountChanged = new EventEmitter<number>();

  sessionId: string = "";
  transactionUUID: string = "";
  isLoading = false;
  isLoadingPayment = false;
  isInitPayment = false;
  paymentError = false;
  form: FormGroup;

  MIN_AMOUNT = 0;
  MAX_AMOUNT = 0;

  // Charge scheme properties
  currentChargeScheme: ChargeScheme | null = null;

  // New properties for total amount mode
  paymentMode: "charge" | "total" = "charge"; // Default to charge mode
  isUpdatingAmount = false; // Prevent circular updates

  private paymentRetryCount = 0;
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly SCRIPT_LOAD_TIMEOUT = 10000;

  private checkoutInitialized = false;
  private containerReady = false;
  private destroy$ = new Subject<void>();
  private paymentStatusInterval: any;
  private containerCheckAttempts = 0;
  private readonly MAX_CONTAINER_CHECK_ATTEMPTS = 10;

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private paymentService: PaymentService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private router: Router,
    private chargeCalculationService: ChargeCalculationService
  ) {
    this.form = this.fb.group({});
  }

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngAfterViewInit(): void {
    this.containerReady = true;
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.cleanupCheckout();
    this.clearPaymentStatusCheck();
  }

  private initializeComponent(): void {
    if (!this.currentMeterInfo) {
      this.notificationService.ErrorNotification(
        this.translate.instant("Meter_Info_Not_Available")
      );
      return;
    }

    this.MIN_AMOUNT = this.currentMeterInfo?.minChargeLimit || 0;
    this.MAX_AMOUNT = this.currentMeterInfo?.maxChargeLimit || 0;
    this.createChargingForm();
  }

  createChargingForm(): void {
    this.form = this.fb.group({
      currency: ["EGP", Validators.required],
      amount: [
        null,
        [
          Validators.required,
          Validators.min(this.MIN_AMOUNT),
          Validators.max(this.MAX_AMOUNT),
        ],
      ],
      paymentMethod: ["GATEWAY", Validators.required],
      meterId: [this.currentMeter?.meterId, Validators.required],
    });

    // Listen to amount changes to calculate charge scheme
    this.form
      .get("amount")
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        if (!this.isUpdatingAmount) {
          this.onAmountChange(value);
        }
      });
  }

  onAmountChange(amount: number): void {
    if (amount && amount > 0) {
      if (this.paymentMode === "charge") {
        // Calculate total from charge amount
        this.currentChargeScheme =
          this.chargeCalculationService.calculateTotalFromCharge(amount);
        this.chargeAmountChanged.emit(amount);
      } else {
        // Calculate charge amount from total
        this.currentChargeScheme =
          this.chargeCalculationService.calculateChargeFromTotal(amount);
        this.chargeAmountChanged.emit(this.currentChargeScheme.chargeAmount);
      }
    } else {
      this.currentChargeScheme = null;
    }
    this.cdr.detectChanges();
  }

  // Switch payment mode
  onPaymentModeChange(mode: "charge" | "total"): void {
    this.paymentMode = mode;

    // Clear current scheme to avoid confusion
    this.currentChargeScheme = null;

    // Update validators - both modes use same limits now
    this.updateAmountValidators();

    // Clear the form amount to avoid confusion
    this.isUpdatingAmount = true;
    this.form.patchValue({ amount: null });
    this.isUpdatingAmount = false;

    this.cdr.detectChanges();
  }

  private updateAmountValidators(): void {
    const amountControl = this.form.get("amount");
    if (amountControl) {
      // Both modes now use the same MIN_AMOUNT and MAX_AMOUNT limits
      amountControl.setValidators([
        Validators.required,
        Validators.min(this.MIN_AMOUNT),
        Validators.max(this.MAX_AMOUNT),
      ]);
      amountControl.updateValueAndValidity();
    }
  }

  getTotalPaymentAmount(): number {
    return this.currentChargeScheme?.totalPay || 0;
  }

  getChargeAmount(): number {
    return this.currentChargeScheme?.chargeAmount || 0;
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  chargeMeter(): void {
    if (!this.validatePaymentPreconditions()) {
      return;
    }

    this.paymentRetryCount = 0;
    this.containerCheckAttempts = 0;
    this.initializePayment();
  }

  private validatePaymentPreconditions(): boolean {
    if (!this.containerReady) {
      this.notificationService.ErrorNotification(
        this.translate.instant("Payment_Container_Not_Ready")
      );
      return false;
    }

    if (!this.form.valid) {
      this.notificationService.WaringNotification(
        this.translate.instant("Please_Fill_Valid_Amount")
      );
      return false;
    }

    if (!this.currentMeter?.meterId) {
      this.notificationService.ErrorNotification(
        this.translate.instant("Meter_Not_Selected")
      );
      return false;
    }

    // For total mode, validate that the calculated charge amount is within limits
    if (this.paymentMode === "total") {
      const chargeAmount = this.getChargeAmount();
      if (chargeAmount < this.MIN_AMOUNT || chargeAmount > this.MAX_AMOUNT) {
        this.notificationService.WaringNotification(
          this.translate.instant("Charge_Amount_Out_Of_Range", {
            min: this.MIN_AMOUNT,
            max: this.MAX_AMOUNT,
            current: chargeAmount.toFixed(2),
          })
        );
        return false;
      }
    }

    return true;
  }

  private initializePayment(): void {
    this.updatePaymentState({
      isInitPayment: true,
      isLoading: true,
      paymentError: false,
    });

    this.cleanupCheckout();

    const paymentData = this.preparePaymentData();

    this.paymentService
      .initPayment(paymentData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => this.handlePaymentInitResponse(response),
        error: (err) => this.handlePaymentInitError(err),
      });
  }

  private clearHostedCheckoutSession(): void {
    try {
      sessionStorage.removeItem("HostedCheckout_embedContainer");
      sessionStorage.removeItem("HostedCheckout_sessionId");
      sessionStorage.removeItem("HostedCheckout_merchantState");
    } catch (e) {
      console.warn("Could not clear session storage:", e);
    }
  }

  private getBasePathFromUrl(): string {
    const url = window.location.href;
    const origin = window.location.origin;

    const withoutOrigin = url.replace(origin, "");
    const hashIndex = withoutOrigin.indexOf("#");

    const basePath =
      hashIndex >= 0 ? withoutOrigin.slice(0, hashIndex) : withoutOrigin;

    return basePath.endsWith("/") ? basePath : basePath + "/";
  }

  private preparePaymentData(): any {
    const returnPath = this.router.serializeUrl(
      this.router.createUrlTree(["/Payment_Success"])
    );

    const origin = window.location.origin;
    const basePath = this.getBasePathFromUrl();
    const returnUrl = origin + basePath + "#" + returnPath.replace(/^\//, "");

    // Use total payment amount and send breakdown
    const totalAmount = this.getTotalPaymentAmount();
    const chargeAmount = this.getChargeAmount();

    return {
      currency: this.f["currency"].value,
      amount: totalAmount, // Send total payment amount
      paymentMethod: this.f["paymentMethod"].value,
      meterId: this.f["meterId"].value,
      returnUrl: returnUrl,
    };
  }

  private handlePaymentInitResponse(response: any): void {
    if (response?.data?.success && response.data.data.session?.id) {
      this.sessionId = response.data.data.session.id;

      this.transactionUUID = response.transactionUUID || "";
      console.log("Payment session initialized with ID:", this.sessionId);
      console.log("Transaction UUID captured:", this.transactionUUID);

      this.updatePaymentState({
        isInitPayment: false,
        isLoading: false,
        isLoadingPayment: true,
      });

      this.cdr.detectChanges();

      setTimeout(() => {
        this.loadCheckoutWithRetry();
      }, 100);
    } else {
      this.handlePaymentError("Invalid session response", false);
    }
  }

  private handlePaymentInitError(error: any): void {
    this.updatePaymentState({ isInitPayment: false });
    this.handlePaymentError(
      "Payment session init error: " + error.message,
      true
    );
  }

  private loadCheckoutWithRetry(retryCount = 0): void {
    console.log(`Loading checkout script (attempt ${retryCount + 1})`);

    this.loadCheckoutScript()
      .then(() => {
        console.log("Script loaded successfully, configuring checkout...");
        this.ngZone.run(() => {
          setTimeout(() => {
            this.configureCheckout();
          }, 200);
        });
      })
      .catch((error) => {
        console.error("Checkout script load error:", error);

        if (retryCount < this.MAX_RETRY_ATTEMPTS) {
          console.log(
            `Retrying checkout load (${retryCount + 1}/${
              this.MAX_RETRY_ATTEMPTS
            })`
          );
          setTimeout(() => this.loadCheckoutWithRetry(retryCount + 1), 2000);
        } else {
          this.handlePaymentError(
            "Failed to load payment system after multiple attempts",
            true
          );
        }
      });
  }

  private loadCheckoutScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const scriptId = "checkout-js";
      this.removeExistingScript(scriptId);

      this.setupGlobalCallbacks();

      const script = document.createElement("script");
      script.src =
        "https://cibpaynow.gateway.mastercard.com/static/checkout/checkout.min.js";
      script.id = scriptId;

      const timeout = setTimeout(() => {
        reject(new Error("Script load timeout"));
      }, this.SCRIPT_LOAD_TIMEOUT);

      script.onload = () => {
        clearTimeout(timeout);

        if (typeof (window as any).Checkout === "undefined") {
          reject(new Error("Checkout object not available"));
          return;
        }

        console.log("Mastercard Checkout script loaded successfully");

        setTimeout(() => {
          resolve();
        }, 100);
      };

      script.onerror = () => {
        clearTimeout(timeout);
        reject(new Error("Failed to load Mastercard script"));
      };

      document.body.appendChild(script);
    });
  }

  private configureCheckout(): void {
    if (!this.sessionId) {
      this.handlePaymentError("No session ID available", false);
      return;
    }

    console.log("Configuring checkout for session:", this.sessionId);
    this.waitForContainer();
  }

  private waitForContainer(): void {
    const container = document.getElementById("embed-target");

    if (container) {
      console.log("Container found, proceeding with checkout configuration");
      this.proceedWithCheckoutConfiguration(container);
      return;
    }

    this.containerCheckAttempts++;

    if (this.containerCheckAttempts >= this.MAX_CONTAINER_CHECK_ATTEMPTS) {
      this.debugContainerState();
      this.handlePaymentError(
        `Payment container not found after ${this.MAX_CONTAINER_CHECK_ATTEMPTS} attempts`,
        false
      );
      return;
    }

    console.log(
      `Container not found, retrying... (${this.containerCheckAttempts}/${this.MAX_CONTAINER_CHECK_ATTEMPTS})`
    );

    this.cdr.detectChanges();

    setTimeout(() => {
      this.waitForContainer();
    }, 200);
  }

  private proceedWithCheckoutConfiguration(container: HTMLElement): void {
    container.innerHTML = "";

    try {
      this.clearHostedCheckoutSession();

      if (typeof (window as any).Checkout === "undefined") {
        throw new Error("Checkout object is not available");
      }

      console.log("Configuring Mastercard Checkout...");

      (window as any).Checkout.configure({
        session: { id: this.sessionId },
      });

      this.checkoutInitialized = true;
      console.log("Checkout configured successfully");

      this.payEmbedded();
      this.startPaymentStatusMonitoring();
    } catch (error) {
      console.error("Checkout configuration failed:", error);
      this.handlePaymentError("Checkout configuration failed: " + error, true);
    }
  }

  private setupGlobalCallbacks(): void {
    const self = this;
    console.log("Setting up global payment callbacks");

    (window as any).errorCallback = (error: any) => {
      console.log("🔴 Error callback triggered:", error);
      self.ngZone.run(() => {
        console.error("Payment Error:", error);
        self.handlePaymentError(
          "Payment processing failed: " + (error?.message || "Unknown error"),
          true
        );
      });
    };

    (window as any).cancelCallback = () => {
      console.log("🟡 Cancel callback triggered");
      self.ngZone.run(() => {
        console.warn("Payment cancelled by user");
        self.notificationService.WaringNotification(
          self.translate.instant("Payment_Cancelled")
        );
        self.resetPaymentState();
        self.clearPaymentStatusCheck();
      });
    };

    const successHandler = (result?: any) => {
      console.log("🎉 SUCCESS CALLBACK TRIGGERED!", result);
      self.ngZone.run(() => {
        // self.handlePaymentSuccess();
      });
    };

    (window as any).paymentSuccessCallback = successHandler;
    (window as any).onPaymentComplete = successHandler;
    (window as any).paymentComplete = successHandler;
    (window as any).onSuccess = successHandler;
    (window as any).successCallback = successHandler;
    (window as any).completeCallback = successHandler;
    (window as any).onComplete = successHandler;

    window.addEventListener("payment-success", successHandler);
    window.addEventListener("checkout-complete", successHandler);
    window.addEventListener("mastercard-success", successHandler);

    console.log("✅ All payment callbacks and event listeners registered");
  }

  private startPaymentStatusMonitoring(): void {
    if (!this.sessionId) return;

    console.log(
      "🔍 Starting payment status monitoring for session:",
      this.sessionId
    );

    this.clearPaymentStatusCheck();

    let checkCount = 0;
    const maxChecks = 100;

    this.paymentStatusInterval = setInterval(() => {
      checkCount++;

      if (checkCount > maxChecks) {
        console.log("⏱️ Payment status monitoring timeout");
        this.clearPaymentStatusCheck();
        return;
      }

      this.checkPaymentCompletion();
    }, 3000);
  }

  private checkPaymentCompletion(): void {
    const currentUrl = window.location.href;
    if (
      currentUrl.includes("Payment_Success") ||
      currentUrl.includes("payment=success")
    ) {
      console.log("🎉 Payment success detected via URL");
      return;
    }

    try {
      const paymentStatus = sessionStorage.getItem("paymentStatus");
      if (paymentStatus === "completed" || paymentStatus === "success") {
        console.log("🎉 Payment success detected via session storage");
        return;
      }
    } catch (e) {
      // Silently handle session storage errors
    }

    const container = document.getElementById("embed-target");
    if (container) {
      const containerText = container.innerText?.toLowerCase() || "";
      const containerHTML = container.innerHTML?.toLowerCase() || "";

      if (
        containerText.includes("success") ||
        containerText.includes("completed") ||
        containerText.includes("approved") ||
        containerHTML.includes("success") ||
        containerHTML.includes("completed")
      ) {
        console.log("🎉 Payment success detected via container content");
        return;
      }
    }

    try {
      const checkout = (window as any).Checkout;
      if (checkout && typeof checkout.getStatus === "function") {
        const status = checkout.getStatus();
        if (status === "SUCCESS" || status === "COMPLETED") {
          console.log("🎉 Payment success detected via Checkout status");
        }
      }
    } catch (error) {
      console.debug("Checkout status check error:", error);
    }
  }

  private clearPaymentStatusCheck(): void {
    if (this.paymentStatusInterval) {
      clearInterval(this.paymentStatusInterval);
      this.paymentStatusInterval = null;
      console.log("🛑 Payment status monitoring stopped");
    }
  }

  private payEmbedded(): void {
    if (!this.checkoutInitialized) {
      this.handlePaymentError("Checkout not initialized", false);
      return;
    }

    const container = document.getElementById("embed-target");
    if (!container) {
      this.handlePaymentError("Payment container disappeared", false);
      return;
    }

    const containerStyle = window.getComputedStyle(container);
    if (containerStyle.display === "none") {
      console.warn("Container is hidden, making it visible");
      container.style.display = "block";
    }

    this.updatePaymentState({
      isLoadingPayment: false,
      isLoading: false,
    });

    try {
      console.log("🚀 Showing embedded payment page");
      (window as any).Checkout.showEmbeddedPage("#embed-target");

      console.log("✅ Payment form embedded successfully");
    } catch (error) {
      console.error("Embedded payment failed:", error);
      this.handlePaymentError("Embedded payment failed: " + error, true);
    }
  }

  private handlePaymentError(message: string, allowRetry: boolean): void {
    console.error("Payment Error:", message);

    this.clearPaymentStatusCheck();

    this.updatePaymentState({
      paymentError: true,
      isLoading: false,
      isLoadingPayment: false,
      isInitPayment: false,
    });

    const userMessage =
      this.translate.instant("Payment_Error") + ": " + message;

    if (allowRetry && this.paymentRetryCount < this.MAX_RETRY_ATTEMPTS) {
      this.notificationService.WaringNotification(userMessage);
    } else {
      this.notificationService.ErrorNotification(userMessage);
    }

    if (!allowRetry || this.paymentRetryCount >= this.MAX_RETRY_ATTEMPTS) {
      setTimeout(() => {
        this.resetPaymentState();
        this.cleanupCheckout();
      }, 5000);
    }
  }

  retryPayment(): void {
    if (this.paymentRetryCount >= this.MAX_RETRY_ATTEMPTS) {
      this.notificationService.ErrorNotification(
        this.translate.instant("Payment_Max_Retries_Exceeded")
      );
      return;
    }

    this.paymentRetryCount++;
    this.containerCheckAttempts = 0;

    console.log(
      `Retrying payment (attempt ${this.paymentRetryCount}/${this.MAX_RETRY_ATTEMPTS})`
    );

    this.resetPaymentState();
    this.cleanupCheckout();

    setTimeout(() => {
      this.chargeMeter();
    }, 1000);
  }

  private resetPaymentState(): void {
    this.updatePaymentState({
      isLoading: false,
      isLoadingPayment: false,
      isInitPayment: false,
      paymentError: false,
    });

    this.sessionId = "";
    this.checkoutInitialized = false;
    this.containerCheckAttempts = 0;
    this.currentChargeScheme = null;
  }

  clearErrorState(): void {
    this.updatePaymentState({
      paymentError: false,
    });
  }

  cancelPayment(): void {
    console.log("🟡 User initiated payment cancellation");

    this.clearPaymentStatusCheck();

    this.notificationService.WaringNotification(
      this.translate.instant("Payment_Cancelled")
    );

    this.resetPaymentState();
    this.cleanupCheckout();

    this.form.patchValue({
      amount: null,
    });
  }

  private updatePaymentState(
    updates: Partial<{
      isLoading: boolean;
      isLoadingPayment: boolean;
      isInitPayment: boolean;
      paymentError: boolean;
    }>
  ): void {
    Object.assign(this, updates);
    this.cdr.detectChanges();
  }

  private cleanupCheckout(): void {
    this.clearPaymentStatusCheck();

    setTimeout(() => {
      this.removeExistingScript("checkout-js");
      this.clearPaymentContainer();
      this.destroyGlobalCallbacks();
    }, 1000);
  }

  private removeExistingScript(scriptId: string): void {
    const script = document.getElementById(scriptId);
    if (script) {
      script.remove();
      console.log("Removed existing script:", scriptId);
    }
  }

  private clearPaymentContainer(): void {
    const container = document.getElementById("embed-target");
    if (container) {
      container.innerHTML = "";
      console.log("Cleared payment container");
    }
  }

  private destroyGlobalCallbacks(): void {
    const callbackNames = [
      "errorCallback",
      "cancelCallback",
      "paymentSuccessCallback",
      "onPaymentComplete",
      "paymentComplete",
      "onSuccess",
      "successCallback",
      "completeCallback",
      "onComplete",
    ];

    callbackNames.forEach((name) => {
      delete (window as any)[name];
    });

    const eventNames = [
      "payment-success",
      "checkout-complete",
      "mastercard-success",
    ];
    eventNames.forEach((eventName) => {
      // Event listener cleanup can be added here if needed
    });

    console.log("🧹 Global callbacks and event listeners cleaned up");
  }

  private debugContainerState(): void {
    console.log("🔍 Debugging container state:");
    console.log("- sessionId:", this.sessionId);
    console.log("- transactionUUID:", this.transactionUUID);
    console.log("- isLoading:", this.isLoading);
    console.log("- isLoadingPayment:", this.isLoadingPayment);
    console.log("- containerReady:", this.containerReady);

    const container = document.getElementById("embed-target");
    console.log("- Container exists:", !!container);

    if (container) {
      console.log(
        "- Container display:",
        window.getComputedStyle(container).display
      );
      console.log(
        "- Container visibility:",
        window.getComputedStyle(container).visibility
      );
    }

    const paymentCard = document.querySelector(".payment-card");
    console.log("- Payment card exists:", !!paymentCard);

    console.log("- Template condition (sessionId):", !!this.sessionId);
  }

  // Updated Getter methods - both modes use same validation now
  get amountErrorMessage(): string {
    const control = this.f["amount"];
    if (control.hasError("required")) {
      return this.translate.instant("Amount_Required");
    }
    if (control.hasError("min")) {
      return this.translate.instant("Amount_Min_Error", {
        min: this.MIN_AMOUNT,
      });
    }
    if (control.hasError("max")) {
      return this.translate.instant("Amount_Max_Error", {
        max: this.MAX_AMOUNT,
      });
    }
    return "";
  }

  get currentRetryCount(): number {
    return this.paymentRetryCount;
  }

  get maxRetryAttempts(): number {
    return this.MAX_RETRY_ATTEMPTS;
  }

  get canRetry(): boolean {
    return (
      this.paymentRetryCount < this.MAX_RETRY_ATTEMPTS &&
      !this.isInitPayment &&
      !this.isLoading
    );
  }

  get isRetryLimitReached(): boolean {
    return this.paymentRetryCount >= this.MAX_RETRY_ATTEMPTS;
  }

  get amountPlaceholder(): string {
    if (this.paymentMode === "charge") {
      return this.translate.instant("Enter_Charge_Amount");
    } else {
      return this.translate.instant("Enter_Total_Amount");
    }
  }

  get amountLabel(): string {
    if (this.paymentMode === "charge") {
      return this.translate.instant("Charge_Amount");
    } else {
      return this.translate.instant("Total_Amount");
    }
  }

  // Updated to use same hint for both modes
  get amountHint(): string {
    return this.translate.instant("Amount_Hint", {
      min: this.MIN_AMOUNT,
      max: this.MAX_AMOUNT,
    });
  }
}
