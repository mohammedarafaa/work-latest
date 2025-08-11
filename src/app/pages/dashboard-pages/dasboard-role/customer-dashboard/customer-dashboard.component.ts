import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  HostListener,
} from "@angular/core";
import { FormGroup, FormBuilder, AbstractControl } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ApiResponse, AuthToken } from "@model/auth/auth.model";
import { MeterSummery, MeterSummeryDTo } from "@model/meter.model";
import {
  MeterDailyConsumptionDTO,
  MeterDailyConsumption,
  MeterPageableResponse,
  ConsumptionRow,
  TableRecord,
  BillingRecord,
  ApiResponseListDailyRecord,
  ApiResponsePageableDailyRecord,
} from "@model/meter-consumption-history.model";
import { paging_$Searching } from "@model/Utils/Pagination";
import { TranslateService } from "@ngx-translate/core";
import { AuthenticationService } from "@service/auth/authentication.service";
import { DashboardService } from "@service/services/dashboard.service";
import { MeterConsumptionHistoryService } from "@service/services/meter-consumption-history.service";
import { LoaderService } from "@service/shared/loader.service";
import { NotificationService } from "@service/shared/notifcation.service";
import { SharedService } from "@service/shared/Shared.service";
import * as Highcharts from "highcharts";
import { BehaviorSubject, Subject, takeUntil } from "rxjs";
import { PersonalInfo } from "src/app/models/profile.model";
import { ProfileService } from "../../../../service/profile.service";

type DashboardType = "consumption" | "billing";

@Component({
  selector: "app-customer-dashboard",
  templateUrl: "./customer-dashboard.component.html",
  styleUrls: ["./customer-dashboard.component.scss"],
})
export class CustomerDashboardComponent implements OnInit, OnDestroy {
  @ViewChild("metersSection", { static: false }) metersSection!: ElementRef;
  @ViewChild("chartSection", { static: false }) chartSection!: ElementRef;

  private destroy$ = new Subject<void>();
  private isApplyingFiltersFlag = false;
  Highcharts: typeof Highcharts = Highcharts;
  isMobile: boolean = false;

  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    this.isMobile = window.innerWidth < 768;
  }

  // Dashboard control
  dashboardTypes = [
    {
      value: "consumption",
      label: "Consumption_History",
      icon: "fas fa-chart-line",
    },
    { value: "billing", label: "Billing_History", icon: "fas fa-credit-card" },
  ];
  currentDashboard: DashboardType = "consumption";

  // Months selector
  monthsOptions = [
    { value: 1, label: "1_Month" },
    { value: 2, label: "2_Months" },
    { value: 3, label: "3_Months" },
  ];
  selectedMonths = 1;

  // User and data
  userData!: PersonalInfo;
  now = new Date();
  currentUser!: AuthToken | null;
  selectedMeter: MeterSummery | null = null;
  meterChartData: ConsumptionRow[] = [];
  billingChartData: BillingRecord[] = [];
  meterChartOptions: Highcharts.Options = {};
  isLoadingMeterChart = false;
  meterChartError = "";
  showMeterChart = false;
  showTableView = true; // TABLE AS DEFAULT
  dailyConsumptionTable: TableRecord[] = [];
  billingHistoryTable: BillingRecord[] = [];

  // METERS PAGINATION (for meter cards)
  currentPage = 1;
  pageSize = 6;
  totalItems = 0;
  maxSize = 5;
  pageSizeOptions = [6, 12, 18, 24];

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
  paginatedTableData: any[] = [];

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

  // Meter list data
  meterList!: MeterSummeryDTo;

  // Scroll control
  private pendingScrollToChart = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private notificationService: NotificationService,
    public translate: TranslateService,
    private dashboardService: DashboardService,
    public loaderService: LoaderService,
    private _sharedService: SharedService,
    private meterConsumptionService: MeterConsumptionHistoryService,
    private route: ActivatedRoute,
    private router: Router,
    private profileService: ProfileService
  ) {
    this.createForm();
    this.currentUser = this.authService.getAuthUser();

    // Initialize meters pagination
    this.paging.page = 1;
    this.paging.size = this.pageSize;

    // Initialize data pagination (ONLY FOR TABLE)
    this.dataPaging.page = 1;
    this.dataPaging.size = this.dataPageSize;

    // Sync with legacy variables
    this.tableCurrentPage = 1;
    this.tablePageSize = this.dataPageSize;
  }

  ngOnInit(): void {
    this.isMobile = window.innerWidth < 768;
    this.getProfileData();
    this.getProjectData();
    this.loadAllMeters();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewChecked(): void {
    if (this.pendingScrollToChart && this.chartSection?.nativeElement) {
      setTimeout(() => this.scrollToChartSection(), 0);
      this.pendingScrollToChart = false;
    }
  }

  // Form creation
  createForm(): void {
    this.form = this.fb.group({
      meterType: [null],
      propertyId: [null],
      compoundId: [null],
    });
    this.onCompoundChange();
  }

  private onCompoundChange(): void {
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

  private finishLoading(): void {
    this.isLoading = false;
    this.isApplyingFilters = false;
    this.isViewBalanceLoading = false;
    this.isApplyingFiltersFlag = false;
    this.loaderService.setSpinner(false);
    this.cdr.detectChanges();
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  // Filter methods
  applyFilters(): void {
    this.isApplyingFiltersFlag = true;
    this.isApplyingFilters = true;
    this.isLoading = true;
    this.loaderService.setSpinner(true);
    this.clearSelectedMeter();
    const temp = Object.entries(this.form.value)
      .filter(
        ([_, value]) => value !== undefined && value !== null && value !== ""
      )
      .map(([key, value]) => [key, value]);
    this.filterParam = new URLSearchParams(temp as string[][]);

    this.loadAllMeters();
  }

  resetFilters(): void {
    this.form.reset();
    this.propertyList.next([]);
    this.filterParam = new URLSearchParams();
    this.currentPage = 1;
    this.paging.page = 1;
    this.pageSize = 6;
    this.paging.size = 6;
    this.clearSelectedMeter();
    this.loadAllMeters();
  }

  private clearSelectedMeter(): void {
    this.selectedMeter = null;
    this.meterChartData = [];
    this.billingChartData = [];
    this.dailyConsumptionTable = [];
    this.billingHistoryTable = [];
    this.showMeterChart = false;
    this.meterChartError = "";

    // Reset data pagination (ONLY FOR TABLE)
    this.dataCurrentPage = 1;
    this.dataPaging.page = 1;
    this.dataTotalItems = 0;

    // Reset legacy variables
    this.tableCurrentPage = 1;
    this.tableTotalItems = 0;
    this.paginatedTableData = [];
  }

  // Data loading methods
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

  getProfileData() {
    this.profileService.getPersonalInfo().subscribe({
      next: (value) => {
        console.log(value);
        if (value.data) {
          this.userData = value.data;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
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
              (p: any) =>
                p.id === currentPropertyId || p.propertyId === currentPropertyId
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

  loadAllMeters(): void {
    this.isLoading = true;
    this.dashboardService
      .getAllMeterFilter(this.paging, this.filterParam)
      .subscribe({
        next: (response: ApiResponse<MeterSummeryDTo>) => {
          if (response.status === 200) {
            this.meterList = response.data!;
            this.totalItems = this.meterList.totalElements || 0;
            if (
              this.meterList.content &&
              this.meterList.content.length > 0 &&
              !this.selectedMeter
            ) {
              this.selectMeter(this.meterList.content[0]);
            }
          }
        },
        error: (err) => {
          this.notificationService.ErrorNotification(
            this.translate.instant(`${err.message}`)
          );
        },
        complete: () => {
          this.finishLoading();
        },
      });
  }

  // Dashboard and view change handlers
  onDashboardChange(dashboardType: DashboardType): void {
    this.currentDashboard = dashboardType;
    this.resetDataPagination();
    if (this.selectedMeter) {
      this.loadMeterData();
    }
  }

  onMonthsChange(months: number): void {
    this.selectedMonths = months;
    this.resetDataPagination();
    if (this.selectedMeter) {
      this.loadMeterData();
    }
  }

  toggleDataView(viewType: "chart" | "table"): void {
    this.showTableView = viewType === "table";
    this.resetDataPagination();
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

  // METERS PAGINATION HANDLERS (for meter cards)
  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.paging.size = newSize;
    this.currentPage = 1;
    this.paging.page = 1;
    this.loadAllMeters();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.paging.page = page;
    this.loadAllMeters();
  }

  // DATA PAGINATION HANDLERS (ONLY FOR TABLE VIEW)
  onDataPageChange(page: number): void {
    // Only allow pagination changes in table view
    if (!this.showTableView) {
      console.warn("Pagination is only available in table view");
      return;
    }

    console.log("Data page change requested:", page);
    this.dataCurrentPage = page;
    this.dataPaging.page = page;

    // Sync legacy variables
    this.tableCurrentPage = page;

    // Trigger API call to load new page data
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

    // Trigger API call with new page size
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

  // Helper methods for current data
  getCurrentTableData(): any[] {
    return this.currentDashboard === "consumption"
      ? this.dailyConsumptionTable
      : this.billingHistoryTable;
  }

  getCurrentTableTotalItems(): number {
    return this.currentDashboard === "consumption"
      ? this.dataTotalItems
      : this.billingHistoryTable.length;
  }

  // Meter selection
  selectMeter(meter: MeterSummery): void {
    this.selectedMeter = meter;
    this.showMeterChart = true;
    this.resetDataPagination();
    this.loadMeterData();
  }

  isMeterSelected(meter: MeterSummery): boolean {
    return this.selectedMeter?.meterId === meter.meterId;
  }

  onViewHistoryClick(meter: MeterSummery): void {
    if (!this.isMeterSelected(meter)) {
      this.selectMeter(meter);
      this.pendingScrollToChart = true;
      this.cdr.detectChanges();
    } else {
      this.pendingScrollToChart = true;
      this.cdr.detectChanges();
    }
  }

  private scrollToChartSection(): void {
    try {
      if (this.chartSection?.nativeElement) {
        const navbarHeight = 80; // Adjust based on your navbar height
        const elementPosition = this.chartSection.nativeElement.offsetTop;
        const offsetPosition = elementPosition - navbarHeight;
        this.chartSection.nativeElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
          top: offsetPosition,
        });
      }
    } catch (error) {
      // Fails silently
    }
  }

  // MAIN METHOD: Load meter data with pagination ONLY for table view
  private loadMeterData(): void {
    if (!this.selectedMeter) return;

    console.log("Loading meter data:", {
      page: this.dataCurrentPage,
      size: this.dataPageSize,
      showTableView: this.showTableView,
      dashboard: this.currentDashboard,
    });

    this.isLoadingMeterChart = true;
    this.meterChartError = "";

    if (this.showTableView) {
      // TABLE VIEW: Use backend pagination API
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
      // CHART VIEW: Use list API for ALL data (NO PAGINATION)
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

    this.generateBillingFromExistingData();
    this.updateChart();
    this.updateTable();
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

    // Reset pagination variables for chart view
    this.dataTotalItems = 0;
    this.dataCurrentPage = 1;
    this.tableTotalItems = 0;
    this.tableCurrentPage = 1;

    this.generateBillingFromExistingData();
    this.updateChart();
    this.updateTable();
    this.meterChartError = "";

    console.log(
      "Chart loaded with ALL data (no pagination):",
      this.meterChartData.length,
      "records"
    );
  }

  private generateBillingFromExistingData(): void {
    if (!this.meterChartData.length) return;

    const meterType = this.selectedMeter?.type?.toUpperCase() || "ELECTRICITY";
    let baseRate: number;

    switch (meterType) {
      case "ELECTRICITY":
        baseRate = 0.85;
        break;
      case "GAS":
        baseRate = 2.15;
        break;
      case "WATER":
        baseRate = 3.5;
        break;
      default:
        baseRate = 1.0;
    }

    const monthlyData = new Map<string, number>();
    this.meterChartData.forEach((record, index) => {
      const month = this.formatDateToMonth(record.date);
      if (!monthlyData.has(month)) {
        monthlyData.set(month, 0);
      }

      if (index > 0) {
        const dailyUsage = Math.max(
          0,
          record.consumption - this.meterChartData[index - 1].consumption
        );
        monthlyData.set(month, monthlyData.get(month)! + dailyUsage);
      }
    });

    this.billingChartData = Array.from(monthlyData.entries()).map(
      ([month, consumption]) => {
        const unitRate = baseRate + (Math.random() * 0.2 - 0.1);
        return {
          month,
          consumption,
          unitRate: parseFloat(unitRate.toFixed(4)),
          totalCost: parseFloat((consumption * unitRate).toFixed(2)),
        };
      }
    );
  }

  private updateChart(): void {
    if (this.currentDashboard === "consumption") {
      this.createConsumptionChart();
    } else {
      this.createBillingChart();
    }
  }

  private updateTable(): void {
    if (this.currentDashboard === "consumption") {
      this.createConsumptionTable();
    } else {
      this.createBillingTable();
    }
  }

  private createConsumptionChart(): void {
    if (!this.meterChartData.length) {
      this.meterChartOptions = {};
      return;
    }

    const categories = this.meterChartData.map((row) =>
      this.formatDisplayDate(row.date)
    );
    const meterReadings = this.meterChartData.map((row) => row.consumption);
    const creditData = this.meterChartData.map((row) => row.availableCredit);

    this.meterChartOptions = {
      chart: { type: "line", height: 400, backgroundColor: "#ffffff" },
      title: {
        text: `${this.translate.instant("Consumption_Chart")} - ${
          this.selectedMeter?.meterSerial
        }`,
      },
      xAxis: {
        categories: categories,
        title: { text: this.translate.instant("Date") },
      },
      yAxis: [
        { title: { text: this.translate.instant("Meter_Reading") }, min: 0 },
        {
          title: { text: this.translate.instant("Available_Credit") },
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

  private createBillingChart(): void {
    if (!this.billingChartData.length) {
      this.meterChartOptions = {};
      return;
    }

    const categories = this.billingChartData.map((record) => record.month);
    const consumptionData = this.billingChartData.map(
      (record) => record.consumption
    );
    const costData = this.billingChartData.map((record) => record.totalCost);

    this.meterChartOptions = {
      chart: { type: "column", height: 400, backgroundColor: "#ffffff" },
      title: {
        text: `${this.translate.instant("Billing_History")} - ${
          this.selectedMeter?.meterSerial
        }`,
      },
      xAxis: {
        categories: categories,
        title: { text: this.translate.instant("Month") },
      },
      yAxis: [
        {
          title: { text: this.translate.instant("Monthly_Consumption") },
          min: 0,
        },
        {
          title: { text: this.translate.instant("Monthly_Cost") + " (EGP)" },
          opposite: true,
          min: 0,
        },
      ],
      series: [
        {
          name: this.translate.instant("Monthly_Consumption"),
          type: "column",
          data: consumptionData,
          yAxis: 0,
          color: "#3498db",
        },
        {
          name: this.translate.instant("Monthly_Cost"),
          type: "column",
          data: costData,
          yAxis: 1,
          color: "#e74c3c",
        },
      ],
    };
  }

  private createConsumptionTable(): void {
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

  private createBillingTable(): void {
    this.billingHistoryTable = [...this.billingChartData];

    // Apply local pagination for billing data if in table view
    if (
      this.showTableView &&
      this.billingHistoryTable.length > this.dataPageSize
    ) {
      const startIndex = (this.dataCurrentPage - 1) * this.dataPageSize;
      const endIndex = startIndex + this.dataPageSize;
      this.paginatedTableData = this.billingHistoryTable.slice(
        startIndex,
        endIndex
      );
      // Set total for billing pagination
      this.dataTotalItems = this.billingHistoryTable.length;
    } else {
      this.paginatedTableData = [...this.billingHistoryTable];
    }

    console.log(
      "Billing table created with",
      this.paginatedTableData.length,
      "records"
    );
  }

  private calculateDailyUsage(record: ConsumptionRow, index: number): number {
    if (index > 0) {
      const previousReading = this.meterChartData[index - 1].consumption;
      return Math.max(0, record.consumption - previousReading);
    }
    return 0;
  }

  private formatDisplayDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  private formatDateToMonth(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  }

  // Event handlers
  onViewBalanceClick(meter: MeterSummery): void {
    this.isViewBalanceLoading = true;
    setTimeout(() => {
      this.loadAllMeters();
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

  // Helper methods
  trackByMeterId(index: number, item: MeterSummery): number {
    return item.meterId;
  }

  trackByDate(index: number, item: TableRecord): string {
    return item.date;
  }

  trackByMonth(index: number, item: BillingRecord): string {
    return item.month;
  }

  getIcons(type: string): string {
    const upperType = type?.toUpperCase();
    if (upperType === "ELECTRICITY") return "fas fa-bolt";
    else if (upperType === "GAS") return "fas fa-fire";
    else if (upperType === "WATER") return "fas fa-tint";
    else return "fas fa-tachometer-alt";
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

  getProgressWidth(balance: number): number {
    return Math.min((balance / 4000) * 100, 100);
  }

  getDailyUsageClass(usage: number): string {
    if (usage > 100) return "text-danger fw-bold";
    if (usage > 50) return "text-warning fw-bold";
    return "text-success";
  }

  hasValidChartData(): boolean {
    return this.currentDashboard === "consumption"
      ? this.meterChartData.length > 0
      : this.billingChartData.length > 0;
  }

  get Math() {
    return Math;
  }

  // Helper method to get total items for current table
  getTableTotalItems(): number {
    return this.currentDashboard === "consumption"
      ? this.dataTotalItems
      : this.billingHistoryTable.length;
  }

  cleanDate(dateStr: string): Date {
    return new Date(dateStr.replace(/\[.*\]$/, ""));
  }

  // Method to check if pagination should be shown (ONLY for table view)
  shouldShowPagination(): boolean {
    return this.showTableView && this.getTableTotalItems() > this.dataPageSize;
  }
}
