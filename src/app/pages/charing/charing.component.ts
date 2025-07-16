import { HttpClient } from "@angular/common/http";
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  OnDestroy,
} from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  AbstractControl,
  Validators,
} from "@angular/forms";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { ApiResponse } from "@model/auth/auth.model";
import { MeterSummery, MeterSummeryDTo } from "@model/meter.model";
import {
  MeterPaymentTransactionDTo,
  MeterPaymentTransaction,
} from "@model/meterPaymentTransaction.model";
import {
  MeterTransaction,
  MeterTransactionDTo,
} from "@model/meterTransaction.model";
import { paging_$Searching } from "@model/Utils/Pagination";
import { TranslateService } from "@ngx-translate/core";
import { PaymentService } from "@service/payment.service";
import { DashboardService } from "@service/services/dashboard.service";
import { LoaderService } from "@service/shared/loader.service";
import { NotificationService } from "@service/shared/notifcation.service";
import { SharedService } from "@service/shared/Shared.service";
import { BehaviorSubject, Subject, takeUntil } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { ViewportScroller } from "@angular/common";

@Component({
  selector: "app-charing",
  templateUrl: "./charing.component.html",
  styleUrls: ["./charing.component.scss"],
})
export class CharingComponent implements OnInit, OnDestroy {
  form: FormGroup = this.fb.group({});
  selectedCardIndex: number = 0;
  isLoading: boolean = false;
  paging: paging_$Searching = new paging_$Searching();
  filterParam!: URLSearchParams;
  meterTypes = ["GAS", "WATER", "ELECTRICITY"];
  isFilter: boolean = false;
  meterList!: MeterSummeryDTo;
  currentMeter!: MeterSummery;
  currentMeterInfo!: any;

  // Flow 1: URL preselection handling
  private preselectMeterId: string | null = null;
  private shouldAutoFocus = false;
  private destroy$ = new Subject<void>();
  private dataLoaded = false;

  @ViewChild("amountInput") amountInput!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private paymentService: PaymentService,
    private dashboardService: DashboardService,
    private http: HttpClient,
    private notificationService: NotificationService,
    private translate: TranslateService,
    private router: Router,
    public loaderService: LoaderService,
    private _sharedService: SharedService,
    private route: ActivatedRoute,
    private scroller: ViewportScroller
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const meterId = params["meterId"];
        const autoFocus = params["autoFocus"];

        if (meterId) {
          this.shouldAutoFocus = autoFocus === "true";
          this.preselectMeterId = meterId;
          this.loadDataAndPreselect();
        } else {
          this.loadInitialData();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Flow 1: Load data and handle preselection from URL
   */
  private loadDataAndPreselect(): void {
    this.loaderService.setSpinner(true);
    this.isLoading = true;

    Promise.all([this.loadMeterList(), this.loadMeterInfo()])
      .then(() => {
        this.dataLoaded = true;
        this.handlePreselection();
      })
      .catch((error) => {
        this.handleError(error);
      })
      .finally(() => {
        this.isLoading = false;
        this.loaderService.setSpinner(false);
      });
  }

  /**
   * Handle meter preselection after data is loaded
   */
  private handlePreselection(): void {
    if (this.preselectMeterId && this.meterList?.content) {
      const foundMeter = this.meterList.content.find(
        (m) => m.meterId == +this.preselectMeterId!
      );
      if (foundMeter) {
        this.currentMeter = foundMeter;

        if (this.shouldAutoFocus) {
          // Wait for payment component to fully initialize
          setTimeout(() => {
            this.focusOnAmountInput();
          }, 1000);
        }

        // Clean up URL parameters after successful preselection
        this.router.navigate(["/Charging"], { replaceUrl: true });
      } else {
        this.notificationService.WaringNotification(
          this.translate.instant("Meter_Not_Found")
        );
      }

      this.preselectMeterId = null;
      this.shouldAutoFocus = false;
    }
  }

  /**
   * Load initial data without preselection
   */
  private loadInitialData(): void {
    this.pageChange();
  }

  pageChange(): void {
    this.loaderService.setSpinner(true);
    this.isLoading = true;
    this.getAllMeterSummery();
    this.getAllMeterMinMax();
  }

  /**
   * Promise-based meter list loading for better flow control
   */
  private loadMeterList(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.dashboardService
        .getAllMeterFilter(this.paging, this.filterParam)
        .subscribe({
          next: (response: ApiResponse<MeterSummeryDTo>) => {
            if (response.status === 200) {
              this.meterList = response.data!;
              resolve();
            } else {
              reject(new Error(this.translate.instant("Get_Meter_Error")));
            }
          },
          error: (err) => reject(err),
        });
    });
  }

  /**
   * Promise-based meter info loading
   */
  private loadMeterInfo(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.dashboardService.getAllMeterMix_Min().subscribe({
        next: (response: any) => {
          if (response.status === 200) {
            this.currentMeterInfo = response.data;
            resolve();
          } else {
            reject(new Error(this.translate.instant("Get_Meter_Error")));
          }
        },
        error: (err) => reject(err),
      });
    });
  }

  getAllMeterSummery(): void {
    this.dashboardService
      .getAllMeterFilter(this.paging, this.filterParam)
      .subscribe({
        next: (response: ApiResponse<MeterSummeryDTo>) => {
          if (response.status === 200) {
            this.meterList = response.data!;
            this.dataLoaded = true;
          } else {
            this.notificationService.WaringNotification(
              this.translate.instant("Get_Meter_Error")
            );
          }
        },
        error: (err) => {
          this.handleError(err);
        },
        complete: () => {
          this.isLoading = false;
          this.loaderService.setSpinner(false);
        },
      });
  }

  getAllMeterMinMax(): void {
    this.dashboardService.getAllMeterMix_Min().subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.currentMeterInfo = response.data;
        } else {
          this.notificationService.WaringNotification(
            this.translate.instant("Get_Meter_Error")
          );
        }
      },
      error: (err) => {
        this.handleError(err);
      },
      complete: () => {
        this.isLoading = false;
        this.loaderService.setSpinner(false);
      },
    });
  }

  /**
   * Enhanced focus handling with multiple fallback attempts
   */
  private focusOnAmountInput(): void {
    const maxAttempts = 5;
    let attempts = 0;

    const tryFocus = () => {
      attempts++;
      const amountInput = document.getElementById("amount") as HTMLInputElement;

      if (amountInput && amountInput.offsetParent !== null) {
        amountInput.focus();
        amountInput.select();
        return true;
      }

      if (attempts < maxAttempts) {
        setTimeout(tryFocus, 200 * attempts);
      }

      return false;
    };

    tryFocus();
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  createForm(): void {
    this.form = this.fb.group({
      meterType: [null],
    });
  }

  onMeterTypeChange(event: any): void {
    if (event) {
      this.filterParam = new URLSearchParams();
      this.filterParam.append("meterType", event);
      this.pageChange();
    } else {
      this.filterParam = new URLSearchParams();
      this.pageChange();
    }
  }

  chargeMeter(meter: MeterSummery): void {
    this.currentMeter = meter;

    // Only auto-focus if not coming from URL preselection
    if (!this.shouldAutoFocus && this.dataLoaded) {
      setTimeout(() => {
        this.focusOnAmountInput();
      }, 150);
    }
  }

  goBackToMeterList(): void {
    this.currentMeter = null as any;
    this.shouldAutoFocus = false;

    // Navigate without query parameters
    this.router.navigate(["/Charging"]);

    // Smooth scroll to top
    this.scroller.scrollToPosition([0, 0]);
  }

  getIcons(type: string): string {
    const iconMap: { [key: string]: string } = {
      ELECTRICITY: "fa fa-bolt",
      GAS: "fas fa-fire",
      WATER: "fas fa-tint",
    };
    return iconMap[type] || "fas fa-question";
  }

  private handleError(error: any): void {
    console.error("Error:", error);
    this.notificationService.ErrorNotification(
      this.translate.instant("Error_Occurred") + ": " + error.message
    );
  }

  get Math() {
    return Math;
  }
}
