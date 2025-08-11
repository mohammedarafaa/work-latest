import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { PaymentService } from "@service/payment.service";
import { Subject, takeUntil, timer } from "rxjs";

@Component({
  selector: "app-payment-success",
  templateUrl: "./payment-success.component.html",
  styleUrls: ["./payment-success.component.scss"],
})
export class PaymentSuccessComponent implements OnInit, OnDestroy {
  paymentId: string = "";
  transactionNumber: string = "";
  isCheckingStatus = false;
  statusCheckComplete = false;
  transactionStatus: any = null;
  errorMessage = "";
  countdownTimer = 30;

  private destroy$ = new Subject<void>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    // Get parameters from route
    this.paymentId =
      this.activatedRoute.snapshot.paramMap.get("paymentId") || "";
    // this.transactionNumber =
    //   this.activatedRoute.snapshot.queryParamMap.get("transactionNumber") || "";

    if (!this.paymentId) {
      console.warn("No payment ID provided in route");
    }

    if (!this.transactionNumber) {
      console.warn("No transaction number provided in route");
      // Try to get from paymentId if it contains transaction info
      this.transactionNumber = this.paymentId;
    }

    console.log("Payment Success page loaded:", {
      paymentId: this.paymentId,
      // transactionNumber: this.transactionNumber,
    });

    // Check transaction status first
    this.checkPaymentStatus();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  checkPaymentStatus(): void {
    if (!this.transactionNumber) {
      this.errorMessage = "No transaction number available to check status";
      this.startCountdownTimer();
      return;
    }

    this.isCheckingStatus = true;

    this.paymentService
      .paymentSuccess(this.paymentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response:any) => {
          this.isCheckingStatus = false;
          this.statusCheckComplete = true;
          this.transactionStatus = response;

          if (response.status === 200) {
            console.log("Transaction status confirmed as successful");
            this.startCountdownTimer();
          } else {
            this.errorMessage = `Transaction status: ${response.status} - ${
              response.message || "Unknown status"
            }`;
            this.startCountdownTimer();
          }
        },
        error: (error:any) => {
          this.isCheckingStatus = false;
          this.statusCheckComplete = true;
          this.errorMessage = "Failed to check transaction status";
          console.error("Error checking transaction status:", error);
          this.startCountdownTimer();
        },
      });
  }

  private startCountdownTimer(): void {
    timer(0, 1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.countdownTimer--;
        if (this.countdownTimer <= 0) {
          this.goToMeterTransaction();
        }
      });
  }

  goToMeterTransaction(): void {
    this.router.navigate(["/Meter_Transactions"]);
  }

  // Manual navigation method for button click
  navigateToTransactions(): void {
    this.router.navigate(["/Meter_Transactions"]);
  }

  // Method to retry status check
  retryStatusCheck(): void {
    this.errorMessage = "";
    this.statusCheckComplete = false;
    this.countdownTimer = 10;
    this.checkPaymentStatus();
  }
}
