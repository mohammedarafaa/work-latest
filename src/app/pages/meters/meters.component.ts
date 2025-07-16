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
    // Only update property dropdown on compound change
    this.onChanges();
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  // Only update property dropdown, not filters
  onChanges(): void {
    this.form.valueChanges.subscribe((val) => {
      if (val.compoundId) {
        this.getPropertyData(val.compoundId);
      }
    });
  }

  // Apply filters only on button click
  applyFilters(): void {
    this.isApplyingFilters = true;
    this.isLoading = true;
    this.loaderService.setSpinner(true);

    // Prepare filter parameters
    const temp = Object.entries(this.form.value)
      .filter(([_, value]) => value !== undefined && value !== null && value !== "")
      .map(([key, value]) => [key, value]);
    this.filterParam = new URLSearchParams(temp as string[][]);

    // Reload data
    this.pageChange();
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
    this._sharedService.getAllPropertyByCompoundId(compoundId).subscribe({
      next: (list: any) => {
        if (list.status === 200) {
          this.propertyList.next(list.data);
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
          if (response.status === 200) {
            this.meterList = response.data!;
          } else {
            this.notificationService.WaringNotification(
              this.translate.instant(`Get_Meter_Error`)
            );
          }
        },
        error: (err) => {
          this.notificationService.ErrorNotification(
            this.translate.instant(`${err.message}`)
          );
        },
        complete: () => {
          this.isLoading = false;
          this.isApplyingFilters = false;
          this.loaderService.setSpinner(false);
        },
      });
  }

  get Math() {
    return Math;
  }
}
