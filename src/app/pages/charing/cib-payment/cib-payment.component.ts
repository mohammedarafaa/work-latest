import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef,
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

@Component({
  selector: "app-cib-payment",
  templateUrl: "./cib-payment.component.html",
  styleUrls: ["./cib-payment.component.scss"],
})
export class CibPaymentComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() currentMeter!: any;
  @Input() currentMeterInfo!: any;

  sessionId: string = "";
  isLoading = false;
  isLoadingPayment = false;
  isInitPayment = false;
  paymentError = false;
  form: FormGroup;
  MIN_AMOUNT = 0;
  MAX_AMOUNT = 0;
  private checkoutInitialized = false;
  private containerReady = false;

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private paymentService: PaymentService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({});
  }

  ngOnInit(): void {
    this.MIN_AMOUNT = this.currentMeterInfo?.minChargeLimit || 0;
    this.MAX_AMOUNT = this.currentMeterInfo?.maxChargeLimit || 0;
    this.createChargingForm();
  }

  ngAfterViewInit(): void {
    // Ensure DOM is ready before any checkout operations
    this.containerReady = true;
  }

  ngOnDestroy(): void {
    this.cleanupCheckout();
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

  chargeMeter(): void {
    if (!this.containerReady) {
      console.error("Container not ready for payment");
      return;
    }
    this.initializePayment();
  }

  private initializePayment(): void {
    this.isInitPayment = true;
    this.isLoading = true;
    this.paymentError = false;

    // Clean up any existing checkout
    this.cleanupCheckout();

    const originalUrl = window.location.origin;
    const cleanedUrl = originalUrl.replace("#/", "");
    const data = {
      ...this.form.value,
      returnUrl: cleanedUrl + this.f["returnUrl"].value,
      cancelUrl: cleanedUrl + this.f["cancelUrl"].value,
    };

    this.paymentService.initPayment(data).subscribe({
      next: (response) => {
        if (response?.data?.success && response.data.data.session?.id) {
          this.sessionId = response.data.data.session.id;
          this.loadCheckoutWithRetry();
        } else {
          this.handlePaymentError("Invalid session response");
        }
        this.isInitPayment = false;
      },
      error: (err) => {
        this.handlePaymentError("Payment session init error: " + err.message);
        this.isInitPayment = false;
      },
    });
  }

  private loadCheckoutWithRetry(retryCount = 0): void {
    const maxRetries = 3;

    this.loadCheckoutScript()
      .then(() => {
        // Wait for container to be fully rendered
        setTimeout(() => {
          this.configureCheckout();
        }, 100);
      })
      .catch((error) => {
        console.error("Checkout script load error:", error);
        if (retryCount < maxRetries) {
          console.log(
            `Retrying checkout load (${retryCount + 1}/${maxRetries})`
          );
          setTimeout(() => this.loadCheckoutWithRetry(retryCount + 1), 1000);
        } else {
          this.handlePaymentError(
            "Failed to load payment system after multiple attempts"
          );
        }
      });
  }

  private loadCheckoutScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const scriptId = "checkout-js";

      // Remove existing script if present
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement("script");
      script.src =
        "https://cibpaynow.gateway.mastercard.com/static/checkout/checkout.min.js";
      script.id = scriptId;
      script.setAttribute("data-error", "errorCallback");
      script.setAttribute("data-cancel", "cancelCallback");

      script.onload = () => {
        // Ensure global Checkout object is available
        if (typeof (window as any).Checkout === "undefined") {
          reject(new Error("Checkout object not available"));
          return;
        }
        resolve();
      };

      script.onerror = () => {
        reject(new Error("Failed to load Mastercard script"));
      };

      document.body.appendChild(script);
    });
  }

  private configureCheckout(): void {
    if (!this.sessionId) {
      this.handlePaymentError("No session ID available");
      return;
    }

    // Ensure container exists
    const container = document.getElementById("embed-target");
    if (!container) {
      this.handlePaymentError("Payment container not found");
      return;
    }

    // Clear any existing content
    container.innerHTML = "";

    // Set up global callbacks
    (window as any).errorCallback = (error: any) => {
      console.error("Payment Error:", error);
      this.handlePaymentError(
        "Payment processing failed: " + (error.message || "Unknown error")
      );
    };

    (window as any).cancelCallback = () => {
      console.warn("Payment cancelled by user");
      this.notificationService.WaringNotification(
        this.translate.instant("Payment_Cancelled")
      );
      this.resetPaymentState();
    };

    try {
      (window as any).Checkout.configure({
        session: {
          id: this.sessionId,
        },
      });

      this.checkoutInitialized = true;
      this.payEmbedded();
    } catch (error) {
      this.handlePaymentError("Checkout configuration failed: " + error);
    }
  }

  private payEmbedded(): void {
    if (!this.checkoutInitialized) {
      this.handlePaymentError("Checkout not initialized");
      return;
    }

    this.isLoadingPayment = true;

    try {
      // Ensure container is still available
      const container = document.getElementById("embed-target");
      if (!container) {
        throw new Error("Payment container disappeared");
      }

      (window as any).Checkout.showEmbeddedPage("#embed-target");
    } catch (error) {
      this.handlePaymentError("Embedded payment failed: " + error);
    } finally {
      this.isLoading = false;
    }
  }

  private handlePaymentError(message: string): void {
    console.error("Payment Error:", message);
    this.paymentError = true;
    this.isLoading = false;
    this.isLoadingPayment = false;
    this.notificationService.ErrorNotification(
      this.translate.instant("Payment_Error") + ": " + message
    );
    this.resetPaymentState();
  }

  private resetPaymentState(): void {
    this.isLoading = false;
    this.isLoadingPayment = false;
    this.isInitPayment = false;
    this.sessionId = "";
    this.checkoutInitialized = false;
    this.cdr.detectChanges();
  }

  private cleanupCheckout(): void {
    // Remove script
    const script = document.getElementById("checkout-js");
    if (script) {
      script.remove();
    }

    // Clear container
    const container = document.getElementById("embed-target");
    if (container) {
      container.innerHTML = "";
    }

    // Reset state
    this.resetPaymentState();

    // Clear global callbacks
    delete (window as any).errorCallback;
    delete (window as any).cancelCallback;
  }

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
}
