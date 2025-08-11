import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiResponse } from '@model/auth/auth.model';
import { MeterSummeryDTo } from '@model/meter.model';
import { DataTable, DataTableResponse, paging_$Searching } from '@model/Utils/Pagination';
import { DashboardService } from '@service/services/dashboard.service';
import { LoaderService } from '@service/shared/loader.service';
import { NotificationService } from '@service/shared/notifcation.service';

@Component({
  selector: "app-meter-summary",
  templateUrl: "./meter-summary.component.html",
  styleUrls: ["./meter-summary.component.scss"],
})
export class MeterSummaryComponent {
  type!: string;
  meterSummeryData!: MeterSummeryDTo;
  isLoading: boolean = false;
  listOfColumns: string[] = [
    "meterId",
    "meterSerial",
    "type",
    "location",
    "credit",
    "consumption",
    "Action",
  ];
  filterParam!: URLSearchParams;
  paging = new paging_$Searching();
  currentSortColumn: string = "";
  isSortAscending: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private dashboardService: DashboardService,
    private router: Router,
    public loaderService: LoaderService,
    private notificationService: NotificationService
  ) {
    this.route.params.subscribe((params) => {
      if (params["type"]) {
        this.type = params["type"];
        this.getMeterSummary(this.type);
      } else {
        this.router.navigateByUrl("/Error/404");
      }
    });
  }

  ngOnInit(): void {
    this.pageChange();
  }
  // Add these methods to your MeterSummaryComponent class

  /**
   * Get appropriate icon for meter type
   */
  getMeterIcon(type: string): string {
    switch (type?.toUpperCase()) {
      case "WATER":
        return "fa-solid fa-droplet";
      case "ELECTRICITY":
        return "fa-solid fa-bolt";
      case "GAS":
        return "fa-solid fa-fire-flame-curved";
      default:
        return "fa-solid fa-gauge";
    }
  }

  /**
   * Get CSS class for credit display based on amount
   */
  getCreditClass(credit: number): string {
    if (credit <= 10) {
      return "credit-low text-danger";
    } else if (credit <= 50) {
      return "credit-medium text-warning";
    } else {
      return "credit-high text-success";
    }
  }

  /**
   * Calculate consumption percentage for progress bar
   */
  getConsumptionPercentage(consumption: number): number {
    if (!this.meterSummeryData?.content) return 0;

    const maxConsumption = Math.max(
      ...this.meterSummeryData.content.map((m) => m.consumption)
    );
    if (maxConsumption === 0) return 0;

    return (consumption / maxConsumption) * 100;
  }

  /**
   * Calculate total available credit across all meters
   */
  getTotalCredit(): number {
    if (!this.meterSummeryData?.content) return 0;

    return this.meterSummeryData.content.reduce((total, meter) => {
      return total + (meter.availableCredit || 0);
    }, 0);
  }

  /**
   * Calculate total consumption across all meters
   */
  getTotalConsumption(): number {
    if (!this.meterSummeryData?.content) return 0;

    return this.meterSummeryData.content.reduce((total, meter) => {
      return total + (meter.consumption || 0);
    }, 0);
  }

  /**
   * View detailed meter information
   */
  viewMeterDetails(meter: any): void {
    // Navigate to meter details page or open modal
    this.router.navigate(["/meter-details", meter.meterId], {
      queryParams: {
        type: this.type,
        serial: meter.meterSerial,
      },
    });
  }

  /**
   * Export meter data
   */
  exportMeterData(): void {
    // Implement export functionality
    console.log("Exporting meter data for type:", this.type);
    // You can add CSV export, PDF export, etc.
  }

  /**
   * Navigate back to dashboard
   */
  navigateBack(): void {
    this.router.navigate(["/dashboard"]);
  }
  pageChange() {
    this.loaderService.setSpinner(true);
    this.isLoading = true;
    this.getMeterSummary(this.type);
  }

  getMeterSummary(type: string) {
    this.dashboardService
      .getAllMeterByTypePaging(type, this.paging, this.filterParam)
      .subscribe({
        next: (value: ApiResponse<MeterSummeryDTo>) => {
          if (value.status == 200) {
            this.meterSummeryData = value.data!;
          } else {
            this.notificationService.WaringNotification(
              "get_meter_summery_error"
            );
            this.isLoading = false;
          }
        },
        error: (err) => {
          this.notificationService.ErrorNotification("get_meter_summery_error");
          this.loaderService.setSpinner(false);
          this.isLoading = false;
        },
        complete: () => {
          this.loaderService.setSpinner(false);
          this.isLoading = false;
        },
      });
  }

  onSort(column: string) {
    if (this.currentSortColumn === column) {
      this.isSortAscending = !this.isSortAscending;
    } else {
      this.currentSortColumn = column;
      this.isSortAscending = true;
    }

    this.paging.sort = this.currentSortColumn;
    this.paging.sortDirection = this.isSortAscending ? "asc" : "desc";
    this.paging.page = 1;
    this.pageChange();
  }

  getSortIcon(column: string): string {
    if (this.currentSortColumn !== column) {
      return "fa-sort";
    }
    return this.isSortAscending ? "fa-sort-up" : "fa-sort-down";
  }

  onChargeMeter(meter: any): void {
    this.router.navigate(["/Charging"], {
      queryParams: {
        meterId: meter.meterId,
        meterSerial: meter.meterSerial,
        meterType: meter.type,
        autoFocus: "true",
      },
    });
  }

  get Math() {
    return Math;
  }
}
