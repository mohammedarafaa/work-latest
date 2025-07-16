import {
  Component,
  Input,
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
import { TranslateService } from "@ngx-translate/core";
import { PaymentService } from "@service/payment.service";
import { NotificationService } from "@service/shared/notifcation.service";
import { Subject, takeUntil } from "rxjs";

@Component({
  selector: "app-cib-payment",
  templateUrl: "./cib-payment.component.html",
  styleUrls: ["./cib-payment.component.scss"],
})
export class CibPaymentComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() currentMeter!: any;
  @Input() currentMeterInfo!: any;

  // Flow 2: Payment processing state
  sessionId: string = "";
  isLoading = false;
  isLoadingPayment = false;
  isInitPayment = false;
  paymentError = false;
  form: FormGroup;

  MIN_AMOUNT = 0;
  MAX_AMOUNT = 0;

  // Enhanced error handling
  private paymentRetryCount = 0;
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly SCRIPT_LOAD_TIMEOUT = 10000;

  // State management
  private checkoutInitialized = false;
  private containerReady = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private paymentService: PaymentService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
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
  }

  /**
   * Initialize component with proper validation
   */
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
      returnUrl: ["/payment-success", Validators.required],
      cancelUrl: ["/payment-success", Validators.required],
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  /**
   * Flow 2: Main payment initiation method
   */
  chargeMeter(): void {
    if (!this.validatePaymentPreconditions()) {
      return;
    }

    this.paymentRetryCount = 0;
    this.initializePayment();
  }

  /**
   * Validate all preconditions before payment
   */
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

    return true;
  }

  /**
   * Initialize payment session
   */
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
        complete: () => this.updatePaymentState({ isInitPayment: false }),
      });
  }

  /**
   * Prepare payment data with proper URL handling - FIXED to remove unsupported field
   */
  private preparePaymentData(): any {
    const originalUrl = window.location.origin;
    const cleanedUrl = originalUrl.replace("#/", "");

    // Only include fields that are supported by the backend
    return {
      currency: this.f["currency"].value,
      amount: this.f["amount"].value,
      paymentMethod: this.f["paymentMethod"].value,
      meterId: this.f["meterId"].value,
      returnUrl: cleanedUrl + this.f["returnUrl"].value,
      cancelUrl: cleanedUrl + this.f["cancelUrl"].value,
    };
  }

  /**
   * Handle payment initialization response
   */
  private handlePaymentInitResponse(response: any): void {
    if (response?.data?.success && response.data.data.session?.id) {
      this.sessionId = response.data.data.session.id;
      this.loadCheckoutWithRetry();
    } else {
      this.handlePaymentError("Invalid session response", false);
    }
  }

  /**
   * Handle payment initialization error
   */
  private handlePaymentInitError(error: any): void {
    this.handlePaymentError(
      "Payment session init error: " + error.message,
      true
    );
  }

  /**
   * Load checkout script with retry mechanism
   */
  private loadCheckoutWithRetry(retryCount = 0): void {
    this.loadCheckoutScript()
      .then(() => {
        this.ngZone.run(() => {
          setTimeout(() => {
            this.configureCheckout();
          }, 150);
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
          setTimeout(() => this.loadCheckoutWithRetry(retryCount + 1), 1000);
        } else {
          this.handlePaymentError(
            "Failed to load payment system after multiple attempts",
            true
          );
        }
      });
  }

  /**
   * Load Mastercard checkout script with timeout
   */
  private loadCheckoutScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const scriptId = "checkout-js";

      this.removeExistingScript(scriptId);

      const script = document.createElement("script");
      script.src =
        "https://cibpaynow.gateway.mastercard.com/static/checkout/checkout.min.js";
      script.id = scriptId;
      script.setAttribute("data-error", "errorCallback");
      script.setAttribute("data-cancel", "cancelCallback");

      // Set up timeout
      const timeout = setTimeout(() => {
        reject(new Error("Script load timeout"));
      }, this.SCRIPT_LOAD_TIMEOUT);

      script.onload = () => {
        clearTimeout(timeout);
        if (typeof (window as any).Checkout === "undefined") {
          reject(new Error("Checkout object not available"));
          return;
        }
        resolve();
      };

      script.onerror = () => {
        clearTimeout(timeout);
        reject(new Error("Failed to load Mastercard script"));
      };

      document.body.appendChild(script);
    });
  }

  /**
   * Configure checkout with enhanced error handling
   */
  private configureCheckout(): void {
    if (!this.sessionId) {
      this.handlePaymentError("No session ID available", false);
      return;
    }

    const container = document.getElementById("embed-target");
    if (!container) {
      this.handlePaymentError("Payment container not found", false);
      return;
    }

    container.innerHTML = "";
    this.setupGlobalCallbacks();

    try {
      (window as any).Checkout.configure({
        session: { id: this.sessionId },
      });

      this.checkoutInitialized = true;
      this.payEmbedded();
    } catch (error) {
      this.handlePaymentError("Checkout configuration failed: " + error, true);
    }
  }

  /**
   * Set up global payment callbacks
   */
  private setupGlobalCallbacks(): void {
    (window as any).errorCallback = (error: any) => {
      this.ngZone.run(() => {
        console.error("Payment Error:", error);
        this.handlePaymentError(
          "Payment processing failed: " + (error.message || "Unknown error"),
          true
        );
      });
    };

    (window as any).cancelCallback = () => {
      this.ngZone.run(() => {
        console.warn("Payment cancelled by user");
        this.notificationService.WaringNotification(
          this.translate.instant("Payment_Cancelled")
        );
        this.resetPaymentState();
      });
    };
  }

  /**
   * Display embedded payment page
   */
  private payEmbedded(): void {
    if (!this.checkoutInitialized) {
      this.handlePaymentError("Checkout not initialized", false);
      return;
    }

    this.updatePaymentState({ isLoadingPayment: true });

    try {
      const container = document.getElementById("embed-target");
      if (!container) {
        throw new Error("Payment container disappeared");
      }

      (window as any).Checkout.showEmbeddedPage("#embed-target");
    } catch (error) {
      this.handlePaymentError("Embedded payment failed: " + error, true);
    } finally {
      this.updatePaymentState({ isLoading: false });
    }
  }

  /**
   * Enhanced error handling with retry logic
   */
  private handlePaymentError(message: string, allowRetry: boolean): void {
    console.error("Payment Error:", message);

    this.updatePaymentState({
      paymentError: true,
      isLoading: false,
      isLoadingPayment: false,
    });

    const userMessage =
      this.translate.instant("Payment_Error") + ": " + message;

    if (allowRetry && this.paymentRetryCount < this.MAX_RETRY_ATTEMPTS) {
      this.notificationService.WaringNotification(userMessage);
    } else {
      this.notificationService.ErrorNotification(userMessage);
    }

    this.resetPaymentState();
  }

  /**
   * Retry payment with enhanced logic
   */
  retryPayment(): void {
    if (this.paymentRetryCount >= this.MAX_RETRY_ATTEMPTS) {
      this.notificationService.ErrorNotification(
        this.translate.instant("Payment_Max_Retries_Exceeded")
      );
      return;
    }

    this.paymentRetryCount++;
    console.log(
      `Retrying payment (${this.paymentRetryCount}/${this.MAX_RETRY_ATTEMPTS})`
    );

    // Clean state before retry
    this.resetPaymentState();

    // Retry with delay
    setTimeout(() => {
      this.chargeMeter();
    }, 1000);
  }

  /**
   * Reset payment state
   */
  private resetPaymentState(): void {
    this.updatePaymentState({
      isLoading: false,
      isLoadingPayment: false,
      isInitPayment: false,
      paymentError: false,
    });

    this.sessionId = "";
    this.checkoutInitialized = false;
  }

  /**
   * Alternative method to full reset - just clear error state
   */
  clearErrorState(): void {
    this.updatePaymentState({
      paymentError: false,
    });
  }

  /**
   * Update payment state with change detection
   */
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

  /**
   * Clean up checkout resources
   */
  private cleanupCheckout(): void {
    this.removeExistingScript("checkout-js");
    this.clearPaymentContainer();
    this.resetPaymentState();
    this.destroyGlobalCallbacks();
  }

  /**
   * Remove existing script element
   */
  private removeExistingScript(scriptId: string): void {
    const script = document.getElementById(scriptId);
    if (script) {
      script.remove();
    }
  }

  /**
   * Clear payment container
   */
  private clearPaymentContainer(): void {
    const container = document.getElementById("embed-target");
    if (container) {
      container.innerHTML = "";
    }
  }

  /**
   * Destroy global callbacks
   */
  private destroyGlobalCallbacks(): void {
    delete (window as any).errorCallback;
    delete (window as any).cancelCallback;
  }

  /**
   * Get amount validation error message
   */
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

  /**
   * Get current retry count for display
   */
  get currentRetryCount(): number {
    return this.paymentRetryCount;
  }

  /**
   * Get max retry attempts for display
   */
  get maxRetryAttempts(): number {
    return this.MAX_RETRY_ATTEMPTS;
  }

  /**
   * Check if payment can be retried
   */
  get canRetry(): boolean {
    return (
      this.paymentRetryCount < this.MAX_RETRY_ATTEMPTS && !this.isInitPayment
    );
  }

  /**
   * Check if retry limit reached
   */
  get isRetryLimitReached(): boolean {
    return this.paymentRetryCount >= this.MAX_RETRY_ATTEMPTS;
  }
}
