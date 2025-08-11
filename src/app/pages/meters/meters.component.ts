import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, AbstractControl } from "@angular/forms";
import { Router } from "@angular/router";
import { ApiResponse } from "@model/auth/auth.model";
import { MeterSummery, MeterSummeryDTo } from "@model/meter.model";
import { paging_$Searching } from "@model/Utils/Pagination";
import { TranslateService } from "@ngx-translate/core";
import { AuthenticationService } from "@service/auth/authentication.service";
import { DashboardService } from "@service/services/dashboard.service";
import { LoaderService } from "@service/shared/loader.service";
import { NotificationService } from "@service/shared/notifcation.service";
import { SharedService } from "@service/shared/Shared.service";
import { BehaviorSubject } from "rxjs";

@Component({
  selector: "app-meters",
  templateUrl: "./meters.component.html",
  styleUrls: ["./meters.component.scss"],
})
export class MetersComponent implements OnInit {
  paging: paging_$Searching = new paging_$Searching();
  filterParam: URLSearchParams = new URLSearchParams();
  meterList!: MeterSummeryDTo;
  isLoading = true;
  isApplyingFilters = false; // For button loading state
  isViewBalanceLoading = false; // For view balance loading state
  private isApplyingFiltersFlag = false; // Prevent form interference during filter processing

  // Filter form and data
  form: FormGroup = this.fb.group({});
  projectList: BehaviorSubject<any> = new BehaviorSubject([]);
  propertyList: BehaviorSubject<any> = new BehaviorSubject([]);
  meterTypes = ["GAS", "WATER", "ELECTRICITY"];

  constructor(
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private notificationService: NotificationService,
    public translate: TranslateService,
    private dashboardService: DashboardService,
    public loaderService: LoaderService,
    private _sharedService: SharedService,
    private router: Router
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.getProjectData();
    this.pageChange(); // Load initial data
  }

  // Navigation method
  navigateToMeters(): void {
    this.router.navigate(["/Meters"]);
  }

  // Form methods
  createForm(): void {
    this.form = this.fb.group({
      meterType: [null],
      propertyId: [null],
      compoundId: [null],
    });
    // Only watch compound changes to update property dropdown
    this.onCompoundChange();
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  // Only watch compound changes, not all form changes
  private onCompoundChange(): void {
    this.form.get("compoundId")?.valueChanges.subscribe((compoundId) => {
      if (compoundId && !this.isApplyingFiltersFlag) {
        this.getPropertyData(compoundId);
      }
    });
  }

  // Apply filters only on button click
  applyFilters(): void {
    this.isApplyingFilters = true;
    this.isApplyingFiltersFlag = true; // Prevent form changes during processing
    this.isLoading = true;
    this.loaderService.setSpinner(true);

    // Prepare filter parameters
    const temp = Object.entries(this.form.value)
      .filter(
        ([_, value]) => value !== undefined && value !== null && value !== ""
      )
      .map(([key, value]) => [key, value]);
    this.filterParam = new URLSearchParams(temp as string[][]);

    // Reload data
    this.pageChange();
  }

  // View Balance click handler
  onViewBalanceClick(meter: MeterSummery): void {
    this.isViewBalanceLoading = true;
    this.getAllMeterSummery();
  }

  // Data loading methods
  getProjectData(): void {
    this._sharedService.getAllProject().subscribe({
      next: (list: any) => {
        if (list.status === 200) {
          this.projectList.next(list.data);
        } else {
          this.notificationService.WaringNotification(
            this.translate.instant(`Get_Status_Warning`)
          );
        }
      },
      error: () => {
        this.notificationService.WaringNotification(
          this.translate.instant(`Get_Status_Error`)
        );
      },
    });
  }

  getPropertyData(compoundId: string): void {
    // Store current property selection before refreshing
    const currentPropertyId = this.form.get("propertyId")?.value;

    this._sharedService.getAllPropertyByCompoundId(compoundId).subscribe({
      next: (list: any) => {
        if (list.status === 200) {
          this.propertyList.next(list.data);

          // Restore property selection if it exists in the new list
          if (currentPropertyId && list.data) {
            const propertyExists = list.data.some(
              (property: any) =>
                property.id === currentPropertyId ||
                property.propertyId === currentPropertyId
            );

            if (propertyExists) {
              // Use setTimeout to ensure dropdown is updated before setting value
              setTimeout(() => {
                this.form
                  .get("propertyId")
                  ?.setValue(currentPropertyId, { emitEvent: false });
              }, 0);
            } else {
              // Clear property selection if it doesn't exist in new compound
              this.form.get("propertyId")?.setValue(null, { emitEvent: false });
            }
          }
        } else {
          this.notificationService.WaringNotification(
            this.translate.instant(`Get_Status_Warning`)
          );
        }
      },
      error: () => {
        this.notificationService.WaringNotification(
          this.translate.instant(`Get_Status_Error`)
        );
      },
    });
  }

  pageChange(): void {
    this.loaderService.setSpinner(true);
    this.isLoading = true;
    this.getAllMeterSummery();
  }

  getAllMeterSummery(): void {
    this.dashboardService
      .getAllMeterFilter(this.paging, this.filterParam)
      .subscribe({
        next: (response: ApiResponse<MeterSummeryDTo>) => {
          this.handleMeterListResponse(response);
        },
        error: (err) => {
          this.handleMeterListError(err);
        },
        complete: () => {
          this.finishLoading(); // Centralized cleanup
        },
      });
  }

  // Centralized cleanup method
  private finishLoading(): void {
    this.isLoading = false;
    this.isApplyingFilters = false;
    this.isViewBalanceLoading = false;
    this.isApplyingFiltersFlag = false; // Reset flag to allow form changes
    this.loaderService.setSpinner(false);
  }

  // Helper methods for better error handling
  private handleMeterListResponse(
    response: ApiResponse<MeterSummeryDTo>
  ): void {
    if (response.status === 200) {
      this.meterList = response.data!;
    } else {
      this.notificationService.WaringNotification(
        this.translate.instant(`Get_Meter_Error`)
      );
    }
  }

  private handleMeterListError(err: any): void {
    this.notificationService.ErrorNotification(
      this.translate.instant(`${err.message}`)
    );
  }

  get Math() {
    return Math;
  }
}
