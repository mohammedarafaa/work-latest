import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from "@angular/core";
import { FormGroup, FormBuilder, AbstractControl } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { MeterConsumptionHistoryService } from "@service/services/meter-consumption-history.service";
import { DashboardService } from "@service/services/dashboard.service";
import { SharedService } from "@service/shared/Shared.service";
import { TranslateService } from "@ngx-translate/core";
import { LoaderService } from "@service/shared/loader.service";
import { NotificationService } from "@service/shared/notifcation.service";
import * as Highcharts from "highcharts";
import { Subject, takeUntil, BehaviorSubject, combineLatest } from "rxjs";
import {
  MeterDailyConsumptionDTO,
  MeterDailyConsumption,
  MeterPageableResponse,
  ConsumptionRow,
  TableRecord,
  ApiResponseListDailyRecord,
  ApiResponsePageableDailyRecord,
} from "@model/meter-consumption-history.model";
import { MeterSummery, MeterSummeryDTo } from "@model/meter.model";
import { paging_$Searching } from "@model/Utils/Pagination";

@Component({
  selector: "app-consumption-history",
  templateUrl: "./consumption-history.component.html",
  styleUrls: ["./consumption-history.component.scss"],
})
export class ConsumptionHistoryComponent implements OnInit, OnDestroy {
  @ViewChild("chartSection", { static: false }) chartSection!: ElementRef;

  Highcharts: typeof Highcharts = Highcharts;

  mode: "dashboard" | "single" = "dashboard";
  meterId!: number;
  meterType = "";
  meterList: MeterSummery[] = [];
  selectedMeter: MeterSummery | null = null;
  meterChartData: ConsumptionRow[] = [];
  meterChartOptions: Highcharts.Options = {};
  isLoadingMeterChart = false;
  meterChartError = "";
  showTableView = true;
  dailyConsumptionTable: TableRecord[] = [];
  private destroy$ = new Subject<void>();
  private isApplyingFiltersFlag = false;

  // Months dropdown (1-3 months only)
  monthsOptions = [
    { value: 1, label: "1_Month" },
    { value: 2, label: "2_Months" },
    { value: 3, label: "3_Months" },
  ];
  selectedMonths = 1;

  // METERS PAGINATION (for meter cards)
  currentPage = 1;
  pageSize = 8;
  totalItems = 0;
  maxSize = 5;
  pageSizeOptions = [6, 8, 12, 18, 24];

  // DATA PAGINATION (ONLY FOR TABLE VIEW)
  dataCurrentPage = 1;
  dataPageSize = 10;
  dataTotalItems = 0;
  dataMaxSize = 5;
  dataPageSizeOptions = [5, 10, 15, 20, 25];

  // Keep original variables for backward compatibility
  tableCurrentPage = 1;
  tablePageSize = 10;
  tableTotalItems = 0;
  paginatedTableData: TableRecord[] = [];

  // Pagination object for data requests (ONLY FOR TABLE)
  dataPaging: paging_$Searching = new paging_$Searching();

  // Filter functionality
  form: FormGroup = this.fb.group({});
  paging: paging_$Searching = new paging_$Searching();
  filterParam: URLSearchParams = new URLSearchParams();
  projectList: BehaviorSubject<any> = new BehaviorSubject([]);
  propertyList: BehaviorSubject<any> = new BehaviorSubject([]);
  meterTypes = ["GAS", "WATER", "ELECTRICITY"];
  isLoading = false;
  isApplyingFilters = false;
  isViewBalanceLoading = false;

  private pendingScroll = false;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private meterConsumptionService: MeterConsumptionHistoryService,
    private dashboardService: DashboardService,
    private _sharedService: SharedService,
    public translate: TranslateService,
    public loaderService: LoaderService,
    private notificationService: NotificationService
  ) {
    this.createForm();
    this.paging.page = 1;
    this.paging.size = 8;

    // Initialize data pagination (ONLY FOR TABLE)
    this.dataPaging.page = 1;
    this.dataPaging.size = this.dataPageSize;

    // Sync with legacy variables
    this.tableCurrentPage = 1;
    this.tablePageSize = this.dataPageSize;
  }

  ngOnInit(): void {
    combineLatest([this.route.paramMap, this.route.queryParamMap])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([paramMap, queryParamMap]) => {
        const meterIdParam = paramMap.get("meterId");

        if (meterIdParam) {
          this.mode = "single";
          this.meterId = +meterIdParam;
          this.loadMeterConsumptionData(this.meterId);
        } else {
          this.mode = "dashboard";

          const page = queryParamMap.get("page");
          this.currentPage = page ? +page : 1;
          this.paging.page = this.currentPage;

          const size = queryParamMap.get("size");
          this.pageSize = size ? +size : 8;
          this.paging.size = this.pageSize;

          this.getProjectData();
          this.loadAllMetersConsumption();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewChecked(): void {
    if (this.pendingScroll && this.chartSection?.nativeElement) {
      setTimeout(() => this.smoothScrollToChart(), 0);
      this.pendingScroll = false;
    }
  }

  createForm(): void {
    this.form = this.fb.group({
      meterType: [null],
      propertyId: [null],
      compoundId: [null],
    });

    this.form.get("compoundId")?.valueChanges.subscribe((compoundId) => {
      if (this.isApplyingFiltersFlag) {
        this.isApplyingFiltersFlag = false;
        return;
      }

      if (compoundId) {
        this.getPropertyData(compoundId);
      } else {
        this.propertyList.next([]);
        this.form.get("propertyId")?.setValue(null, { emitEvent: false });
      }
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  applyFilters(): void {
    this.isApplyingFiltersFlag = true;
    this.isApplyingFilters = true;
    this.isLoading = true;
    this.loaderService.setSpinner(true);
    this.currentPage = 1;
    this.paging.page = 1;
    this.clearSelectedMeter();

    const temp = Object.entries(this.form.value)
      .filter(
        ([_, value]) => value !== undefined && value !== null && value !== ""
      )
      .map(([key, value]) => [key, value]);
    this.filterParam = new URLSearchParams(temp as string[][]);

    this.loadAllMetersConsumption();
  }

  resetFilters(): void {
    this.form.reset();
    this.propertyList.next([]);
    this.filterParam = new URLSearchParams();
    this.currentPage = 1;
    this.paging.page = 1;
    this.pageSize = 8;
    this.paging.size = 8;
    this.clearSelectedMeter();
    this.loadAllMetersConsumption();
  }

  private clearSelectedMeter(): void {
    this.selectedMeter = null;
    this.meterChartData = [];
    this.dailyConsumptionTable = [];
    this.meterChartError = "";

    // Reset data pagination (ONLY FOR TABLE)
    if (this.showTableView) {
      this.dataCurrentPage = 1;
      this.dataPaging.page = 1;
      this.dataTotalItems = 0;
    }

    // Reset legacy variables
    this.tableCurrentPage = 1;
    this.tableTotalItems = 0;
    this.paginatedTableData = [];
  }

  // MAIN METHOD: Load meter data with pagination ONLY for table view
  private loadMeterData(): void {
    if (!this.selectedMeter) return;

    console.log("Loading meter data:", {
      page: this.dataCurrentPage,
      size: this.dataPageSize,
      showTableView: this.showTableView,
    });

    this.isLoadingMeterChart = true;
    this.meterChartError = "";

    if (this.showTableView) {
      // TABLE VIEW ONLY: Use backend pagination API
      this.meterConsumptionService
        .getDailyConsumptionV2(
          this.selectedMeter.meterId,
          this.selectedMonths,
          this.dataCurrentPage - 1, // API uses 0-based pagination
          this.dataPageSize
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: ApiResponsePageableDailyRecord) => {
            if (response.status === 200 && response.data.content) {
              this.processBackendPaginatedData(response.data);
            } else {
              this.meterChartError = "No_Data_Available";
            }
            this.isLoadingMeterChart = false;
          },
          error: (error) => {
            console.error("Table data loading error:", error);
            this.meterChartError = "Error_Loading_Data";
            this.isLoadingMeterChart = false;
          },
        });
    } else {
      // CHART VIEW: Load ALL data without pagination
      this.meterConsumptionService
        .getDailyConsumptionV2List(
          this.selectedMeter.meterId,
          this.selectedMonths
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: ApiResponseListDailyRecord) => {
            if (response.status === 200 && Array.isArray(response.data)) {
              this.processFullDataForChart(response.data);
            } else {
              this.meterChartError = "No_Data_Available";
            }
            this.isLoadingMeterChart = false;
          },
          error: (error) => {
            console.error("Chart data loading error:", error);
            this.meterChartError = "Error_Loading_Data";
            this.isLoadingMeterChart = false;
          },
        });
    }
  }

  // Process backend paginated data (ONLY for table view)
  private processBackendPaginatedData(data: any): void {
    console.log("Processing backend paginated data for TABLE:", data);

    const sortedRecords = [...data.content].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    this.meterChartData = sortedRecords.map((record) => ({
      date: record.date,
      consumption: record.meterReading,
      availableCredit: record.availableCredit,
      meterType: this.selectedMeter?.type || "ELECTRICITY",
    }));

    // Update pagination info from backend (ONLY FOR TABLE)
    this.dataTotalItems = data.totalElements || 0;
    this.dataCurrentPage = (data.number || 0) + 1;
    this.dataPageSize = data.size || this.dataPageSize;

    // Sync legacy variables
    this.tableTotalItems = this.dataTotalItems;
    this.tableCurrentPage = this.dataCurrentPage;
    this.tablePageSize = this.dataPageSize;

    this.createConsumptionTable();
    this.meterChartError = "";

    console.log("Table pagination updated:", {
      totalItems: this.dataTotalItems,
      currentPage: this.dataCurrentPage,
      pageSize: this.dataPageSize,
    });
  }

  // Process full data for chart (NO PAGINATION)
  private processFullDataForChart(data: any[]): void {
    console.log(
      "Processing full data for CHART (no pagination):",
      data.length,
      "total records"
    );

    const sortedRecords = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Use ALL data for chart (no pagination)
    this.meterChartData = sortedRecords.map((record) => ({
      date: record.date,
      consumption: record.meterReading,
      availableCredit: record.availableCredit,
      meterType: this.selectedMeter?.type || "ELECTRICITY",
    }));

    // Reset pagination info for chart view
    this.dataTotalItems = 0;
    this.tableTotalItems = 0;

    this.createConsumptionTable();
    this.transformMeterDataToChart();
    this.meterChartError = "";

    console.log(
      "Chart loaded with ALL data:",
      this.meterChartData.length,
      "records"
    );
  }

  // DATA PAGINATION HANDLERS (ONLY FOR TABLE VIEW)
  onDataPageChange(page: number): void {
    // Only allow pagination in table view
    if (!this.showTableView) {
      console.warn("Pagination is only available in table view");
      return;
    }

    console.log("Data page change requested:", page);
    this.dataCurrentPage = page;
    this.dataPaging.page = page;
    this.tableCurrentPage = page;

    if (this.selectedMeter) {
      this.loadMeterData();
    }
  }

  onDataPageSizeChange(newSize: number): void {
    // Only allow page size changes in table view
    if (!this.showTableView) {
      console.warn("Page size change is only available in table view");
      return;
    }

    console.log("Data page size change requested:", newSize);
    this.dataPageSize = newSize;
    this.dataPaging.size = newSize;
    this.dataCurrentPage = 1; // Reset to first page
    this.dataPaging.page = 1;

    // Sync legacy variables
    this.tablePageSize = newSize;
    this.tableCurrentPage = 1;

    if (this.selectedMeter) {
      this.loadMeterData();
    }
  }

  // Legacy pagination handlers for backward compatibility
  onTablePageChange(page: number): void {
    this.onDataPageChange(page);
  }

  onTablePageSizeChange(newSize: number): void {
    this.onDataPageSizeChange(newSize);
  }

  // Months change handler
  onMonthsChange(months: number): void {
    this.selectedMonths = months;
    this.resetDataPagination();
    if (this.selectedMeter) {
      this.loadMeterData();
    }
  }

  // View toggle method
  toggleDataView(viewType: "chart" | "table"): void {
    this.showTableView = viewType === "table";

    if (this.showTableView) {
      // Reset pagination when switching TO table view
      this.dataCurrentPage = 1;
      this.dataPaging.page = 1;
      this.dataTotalItems = 0;
      this.tableCurrentPage = 1;
      this.tableTotalItems = 0;
    } else {
      // Clear pagination when switching TO chart view
      this.dataTotalItems = 0;
      this.tableTotalItems = 0;
    }

    if (this.selectedMeter) {
      this.loadMeterData();
    }
  }

  private resetDataPagination(): void {
    // ONLY reset pagination for table view
    if (this.showTableView) {
      this.dataCurrentPage = 1;
      this.dataPaging.page = 1;
      this.dataTotalItems = 0;
    }

    // Sync legacy variables
    this.tableCurrentPage = 1;
    this.tableTotalItems = 0;
  }

  // Pagination methods for meters
  onPageChange(page: number): void {
    this.currentPage = page;
    this.paging.page = page;
    this.updateQueryParams({ page: page.toString() });
    this.loadAllMetersConsumption();
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.paging.size = newSize;
    this.currentPage = 1;
    this.paging.page = 1;
    this.updateQueryParams({ page: "1", size: newSize.toString() });
    this.loadAllMetersConsumption();
  }

  private updateQueryParams(params: { [key: string]: string }): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: "merge",
    });
  }

  getProjectData(): void {
    this._sharedService.getAllProject().subscribe({
      next: (list: any) => {
        if (list.status === 200) {
          this.projectList.next(list.data);
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
    const currentPropertyId = this.form.get("propertyId")?.value;

    this._sharedService.getAllPropertyByCompoundId(compoundId).subscribe({
      next: (list: any) => {
        if (list.status === 200) {
          this.propertyList.next(list.data);

          if (currentPropertyId) {
            const propertyExists = list.data.some(
              (p: any) => p.id === currentPropertyId
            );
            if (propertyExists) {
              setTimeout(() => {
                this.form
                  .get("propertyId")
                  ?.setValue(currentPropertyId, { emitEvent: false });
              }, 0);
            }
          }
        }
      },
      error: () => {
        this.notificationService.WaringNotification(
          this.translate.instant(`Get_Status_Error`)
        );
      },
    });
  }

  loadAllMetersConsumption(): void {
    this.isLoadingMeterChart = true;
    this.isLoading = true;

    this.dashboardService
      .getAllMeterFilter(this.paging, this.filterParam)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.status === 200 && response.data?.content) {
            this.totalItems = response.data.totalElements || 0;
            this.currentPage = (response.data.number || 0) + 1;
            this.meterList = response.data.content;
            this.selectFirstMeter();
          } else {
            this.handleEmptyResponse();
          }
          this.finishLoading();
        },
        error: () => {
          this.handleLoadingError();
        },
      });
  }

  private selectFirstMeter(): void {
    if (this.meterList.length > 0) {
      this.selectMeter(this.meterList[0]);
    } else {
      this.selectedMeter = null;
      this.meterChartData = [];
      this.meterChartError = "No_Meters_Found";
    }
  }

  private handleEmptyResponse(): void {
    this.meterList = [];
    this.selectedMeter = null;
    this.meterChartError = "No_Meters_Found";
    this.finishLoading();
  }

  private handleLoadingError(): void {
    this.meterChartError = "Error_Loading_Data";
    this.finishLoading();
  }

  private finishLoading(): void {
    this.isLoadingMeterChart = false;
    this.isLoading = false;
    this.isApplyingFilters = false;
    this.isViewBalanceLoading = false;
    this.isApplyingFiltersFlag = false;
    this.loaderService.setSpinner(false);
  }

  loadMeterConsumptionData(meterId: number): void {
    this.isLoadingMeterChart = true;
    this.meterChartError = "";

    // Find and set the selected meter
    const meter = this.meterList.find((m) => m.meterId === meterId);
    if (meter) {
      this.selectedMeter = meter;
      this.meterType = meter.type;
    }

    // Load data based on current view
    this.loadMeterData();
  }

  selectMeter(meter: MeterSummery): void {
    this.selectedMeter = meter;
    this.meterType = meter.type;
    this.resetDataPagination();
    this.loadMeterData();
    this.meterChartError = "";
  }

  createConsumptionTable(): void {
    this.dailyConsumptionTable = this.meterChartData.map((record, index) => ({
      date: this.formatDisplayDate(record.date),
      meterReading: record.consumption,
      availableCredit: record.availableCredit,
      dailyUsage: this.calculateDailyUsage(record, index),
    }));

    // For table view, data is already paginated from API
    this.paginatedTableData = [...this.dailyConsumptionTable];

    console.log(
      "Consumption table created with",
      this.paginatedTableData.length,
      "records"
    );
  }

  transformMeterDataToChart(): void {
    if (!this.meterChartData.length) {
      this.meterChartOptions = {};
      return;
    }

    const categories = this.meterChartData.map((row) =>
      this.formatDisplayDate(row.date)
    );
    const meterReadings = this.meterChartData.map((row) => row.consumption);
    const creditData = this.meterChartData.map((row) => row.availableCredit);
    const meterType = this.meterChartData[0].meterType;

    this.meterChartOptions = {
      chart: {
        type: "line",
        height: 450,
        backgroundColor: "#fff",
        borderRadius: 8,
      },
      title: {
        text: `${this.translate.instant(
          "Daily_Consumption_Chart"
        )} - ${this.translate.instant("Meter")} ${this.selectedMeter?.meterId}`,
      },
      xAxis: {
        categories,
        title: { text: this.translate.instant("Date") },
      },
      yAxis: [
        {
          title: {
            text: `${this.translate.instant(
              "Meter_Reading"
            )} (${this.getConsumptionUnit(meterType)})`,
          },
          min: 0,
        },
        {
          title: {
            text: `${this.translate.instant("Available_Credit")} (EGP)`,
          },
          opposite: true,
          min: 0,
        },
      ],
      series: [
        {
          name: this.translate.instant("Meter_Reading"),
          type: "line",
          data: meterReadings,
          yAxis: 0,
          color: "#3498db",
        },
        {
          name: this.translate.instant("Available_Credit"),
          type: "line",
          data: creditData,
          yAxis: 1,
          color: "#e74c3c",
        },
      ],
    };
  }

  formatDisplayDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  calculateDailyUsage(record: ConsumptionRow, index: number): number {
    if (index > 0) {
      const previousReading = this.meterChartData[index - 1].consumption;
      return Math.max(0, record.consumption - previousReading);
    }
    return 0;
  }

  getConsumptionUnit(meterType: string): string {
    switch (meterType?.toUpperCase()) {
      case "ELECTRICITY":
        return "kWh";
      case "GAS":
        return "m³";
      case "WATER":
        return "L";
      default:
        return "";
    }
  }

  onViewHistoryClick(meter: MeterSummery, event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    if (!this.isMeterSelected(meter)) {
      this.selectMeter(meter);
      this.pendingScroll = true;
      this.changeDetectorRef.detectChanges();
    } else {
      this.pendingScroll = true;
      this.changeDetectorRef.detectChanges();
    }
  }

  private smoothScrollToChart(): void {
    try {
      if (this.chartSection?.nativeElement) {
        const navbarHeight = 80; // Adjust based on your navbar height
        const elementPosition = this.chartSection.nativeElement.offsetTop;
        const offsetPosition = elementPosition - navbarHeight;
        this.chartSection.nativeElement.scrollIntoView({
          behavior: "smooth",
          top: offsetPosition,
          block: "center",
        });
      }
    } catch (error) {
      // Fails silently
    }
  }

  onMeterCardClick(meter: MeterSummery): void {
    if (this.mode === "dashboard") {
      this.selectMeter(meter);
    }
  }

  onViewBalance(meter: MeterSummery): void {
    this.isViewBalanceLoading = true;
    setTimeout(() => {
      this.loadAllMetersConsumption();
    }, 1000);
  }

  onCharge(meter: MeterSummery): void {
    this.router.navigate(["/Charging"], {
      queryParams: {
        meterId: meter.meterId,
        meterSerial: meter.meterSerial,
        meterType: meter.type,
        autoFocus: "true",
      },
    });
  }

  goBackToAllMeters(): void {
    this.router.navigate(["/Meters"]);
  }

  isMeterSelected(meter: MeterSummery): boolean {
    return this.selectedMeter?.meterId === meter.meterId;
  }

  // Helper method to check if pagination should be shown (ONLY for table view)
  shouldShowPagination(): boolean {
    return this.showTableView && this.dataTotalItems > this.dataPageSize;
  }

  // Helper methods
  trackByDate(index: number, item: TableRecord): string {
    return item.date;
  }

  trackByMeterId(index: number, item: MeterSummery): number {
    return item.meterId;
  }

  getDailyUsageClass(usage: number): string {
    if (usage > 100) return "text-danger fw-bold";
    if (usage > 50) return "text-warning fw-bold";
    return "text-success";
  }

  getUnitOfMeasure(type: string): string {
    switch (type?.toUpperCase()) {
      case "WATER":
        return "m³";
      case "ELECTRICITY":
        return "kWh";
      case "GAS":
        return "m³";
      default:
        return "";
    }
  }

  getIcons(type: string): string {
    const upperType = type?.toUpperCase();
    if (upperType === "ELECTRICITY") return "fas fa-bolt";
    else if (upperType === "GAS") return "fas fa-fire";
    else if (upperType === "WATER") return "fas fa-tint";
    else return "fas fa-tachometer-alt";
  }

  getProgressWidth(balance: number): number {
    return Math.min((balance / 4000) * 100, 100);
  }

  get Math() {
    return Math;
  }
}
