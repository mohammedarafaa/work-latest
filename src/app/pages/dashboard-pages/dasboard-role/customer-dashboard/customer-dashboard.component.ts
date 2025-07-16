import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { FormGroup, FormBuilder, AbstractControl } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ApiResponse, AuthToken } from "@model/auth/auth.model";
import { MeterSummery, MeterSummeryDTo } from "@model/meter.model";
import {
  MeterDailyConsumptionDTO,
  MeterDailyConsumption,
  DailyRecord,
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
import { BehaviorSubject, Subject, takeUntil, combineLatest } from "rxjs";

interface ConsumptionRow {
  meterId: string;
  unitNumber: string;
  address: string;
  date: string;
  month: string;
  consumption: number;
  availableCredit: number;
  meterType: string;
  dailyUsage?: number;
}

interface TableRecord {
  date: string;
  meterReading: number;
  availableCredit: number;
  dailyUsage: number;
}

type DashboardView = "grid" | "list" | "chart";

@Component({
  selector: "app-customer-dashboard",
  templateUrl: "./customer-dashboard.component.html",
  styleUrls: ["./customer-dashboard.component.scss"],
})
export class CustomerDashboardComponent implements OnInit, OnDestroy {
  isMobile = false;
  @ViewChild("chartSection", { static: false }) chartSection!: ElementRef;

  private destroy$ = new Subject<void>();
  Highcharts: typeof Highcharts = Highcharts;

  // Dashboard view control
  currentView: DashboardView = "grid";
  viewOptions: { value: DashboardView; label: string; icon: string }[] = [
    { value: "grid", label: "Grid_View", icon: "fas fa-th-large" },
    { value: "list", label: "List_View", icon: "fas fa-list" },
    { value: "chart", label: "Chart_View", icon: "fas fa-chart-line" },
  ];

  // Meter-specific chart properties
  selectedMeter: MeterSummery | null = null;
  meterChartData: ConsumptionRow[] = [];
  meterChartOptions: Highcharts.Options = {};
  isLoadingMeterChart = false;
  meterChartError = "";
  showMeterChart = false;
  monthsToShow = 3;
  hasAutoSelectedMeter = false;

  // Table/Chart toggle for consumption data
  showTableView = false;
  dailyConsumptionTable: TableRecord[] = [];

  // Dashboard properties
  now = new Date();
  currentUser!: AuthToken | null;
  paging: paging_$Searching = new paging_$Searching();
  filterParam!: URLSearchParams;
  meterList!: MeterSummeryDTo;
  isLoading = true;
  isApplyingFilters = false;
  projectList: BehaviorSubject<any> = new BehaviorSubject([]);
  propertyList: BehaviorSubject<any> = new BehaviorSubject([]);
  meterTypes = ["GAS", "WATER", "ELECTRICITY"];
  form: FormGroup = this.fb.group({});

  constructor(
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private notificationService: NotificationService,
    public translate: TranslateService,
    private dashboardService: DashboardService,
    public loaderService: LoaderService,
    private _sharedService: SharedService,
    private meterConsumptionService: MeterConsumptionHistoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.createForm();
    this.currentUser = this.authService.getAuthUser();
  }

  ngOnInit(): void {
    window.addEventListener("resize", this.checkScreen.bind(this));
    this.checkScreen();

    // Watch for query parameter changes
    combineLatest([this.route.queryParamMap])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([queryParamMap]) => {
        // Get view from query params
        const view = queryParamMap.get("view") as DashboardView;
        this.currentView =
          view && this.viewOptions.some((opt) => opt.value === view)
            ? view
            : "grid";

        // Get months from query params
        const months = queryParamMap.get("months");
        this.monthsToShow = months ? +months : 3;

        // Get selected meter from query params
        const selectedMeterId = queryParamMap.get("meterId");
        if (selectedMeterId) {
          this.hasAutoSelectedMeter = true;
        }

        // Load data after parameters are set
        this.pageChange();
      });

    this.getProjectData();
  }

  ngOnDestroy(): void {
    window.removeEventListener("resize", this.checkScreen.bind(this));
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Screen size detection
  checkScreen() {
    this.isMobile = window.innerWidth < 768; // Bootstrap md breakpoint
  }

  // Navigation to meters page
  navigateToMeters(): void {
    this.router.navigate(["/Meters"]);
  }

  // Auto-select first meter if none selected
  private autoSelectFirstMeter(): void {
    if (
      !this.hasAutoSelectedMeter &&
      this.meterList?.content?.length > 0 &&
      !this.selectedMeter
    ) {
      const firstMeter = this.meterList.content[0];
      this.selectedMeter = firstMeter;
      this.loadMeterConsumptionData(firstMeter.meterId, firstMeter.type);
      this.updateQueryParams({ meterId: firstMeter.meterId.toString() });
    }
  }

  // Switch dashboard view with query parameter update
  switchView(view: DashboardView): void {
    this.currentView = view;
    this.updateQueryParams({ view: view });
  }

  // Switch months display
  switchMonths(months: number): void {
    this.monthsToShow = months;
    this.updateQueryParams({ months: months.toString() });

    // Reload chart data if a meter is selected
    if (this.selectedMeter) {
      this.loadMeterConsumptionData(
        this.selectedMeter.meterId,
        this.selectedMeter.type
      );
    }
  }

  // Toggle between chart and table view
  toggleDataView(viewType: "chart" | "table"): void {
    this.showTableView = viewType === "table";
  }

  // Update query parameters
  private updateQueryParams(params: { [key: string]: string }): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: "merge",
    });
  }

  // Clear all query parameters
  clearQueryParams(): void {
    this.clearChartData();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true,
    });
  }

  // Clear chart data and reset chart state
  private clearChartData(): void {
    this.selectedMeter = null;
    this.meterChartData = [];
    this.meterChartOptions = {};
    this.dailyConsumptionTable = [];
    this.showMeterChart = false;
    this.showTableView = false;
    this.isLoadingMeterChart = false;
    this.meterChartError = "";
    this.hasAutoSelectedMeter = false;
  }

  // Reset all filters
  resetFilters(): void {
    this.form.reset();
    this.propertyList.next([]);
    this.clearChartData();
    this.filterParam = new URLSearchParams();
    this.pageChange();
  }

  // Form methods
  createForm() {
    this.form = this.fb.group({
      meterType: [null],
      propertyId: [null],
      compoundId: [null],
    });
    this.onChanges();
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  // Only load property list on compound change
  onChanges(): void {
    this.form.valueChanges.subscribe((val) => {
      if (val.compoundId) {
        this.getPropertyData(val.compoundId);
      }
    });
  }

  // Apply filters manually
  applyFilters(): void {
    this.isApplyingFilters = true;
    this.clearChartData();

    const temp = Object.entries(this.form.value)
      .filter(
        ([_, value]) => value !== undefined && value !== null && value !== ""
      )
      .map(([key, value]) => [key, value]);
    this.filterParam = new URLSearchParams(temp as string[][]);

    this.pageChange();
    // Reset isApplyingFilters in subscription's complete callback
  }

  pageChange() {
    this.loaderService.setSpinner(true);
    this.isLoading = true;

    this.getAllMeterSummery();
  }

  // Data loading methods
  getProjectData() {
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

  getPropertyData(compoundId: string) {
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

  getAllMeterSummery() {
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
          this.isLoading = false;
          this.isApplyingFilters = false;
          this.loaderService.setSpinner(false);
        },
      });
  }

  private handleMeterListResponse(
    response: ApiResponse<MeterSummeryDTo>
  ): void {
    if (response.status === 200) {
      this.meterList = response.data!;

      if (!this.meterList.content || this.meterList.content.length === 0) {
        this.clearChartData();
      } else {
        setTimeout(() => this.autoSelectFirstMeter(), 100);
      }
    } else {
      this.clearChartData();
      this.notificationService.WaringNotification(
        this.translate.instant(`Get_Meter_Error`)
      );
    }
  }

  private handleMeterListError(err: any): void {
    this.clearChartData();
    this.notificationService.ErrorNotification(
      this.translate.instant(`${err.message}`)
    );
    this.isApplyingFilters = false;
  }

  // Meter selection and chart functionality
  onMeterCardClick(meter: MeterSummery): void {
    this.selectedMeter = meter;
    this.loadMeterConsumptionData(meter.meterId, meter.type);
    this.updateQueryParams({ meterId: meter.meterId.toString() });
    this.smoothScrollToChart();
  }

  // Check if meter is selected
  isMeterSelected(meter: MeterSummery): boolean {
    return this.selectedMeter?.meterId === meter.meterId;
  }

  private loadMeterConsumptionData(meterId: number, meterType: string): void {
    this.isLoadingMeterChart = true;
    this.meterChartError = "";
    this.showMeterChart = true;

    this.meterConsumptionService
      .getDailyConsumption(this.monthsToShow)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (dto) =>
          this.handleMeterConsumptionResponse(dto, meterId, meterType),
        error: (err) => this.handleMeterConsumptionError(err),
      });
  }

  private handleMeterConsumptionResponse(
    dto: MeterDailyConsumptionDTO,
    selectedMeterId: number,
    meterType: string
  ): void {
    if (dto.status === 200 && dto.data) {
      const meterData = dto.data.find(
        (meter) => meter.meterId === selectedMeterId
      );

      if (meterData && meterData.dailyRecords) {
        const sortedRecords = [...meterData.dailyRecords].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        this.meterChartData = sortedRecords.map(
          (record) =>
            ({
              meterId: meterData.meterId.toString(),
              unitNumber: meterData.propertyNo,
              address: `${meterData.block}, ${meterData.propertyNo}`,
              date: record.date,
              month: this.formatDateToMonth(record.date),
              consumption: record.meterReading,
              availableCredit: record.availableCredit,
              meterType: meterData.type,
            } as ConsumptionRow)
        );

        if (this.meterChartData.length > 0) {
          this.transformMeterDataToChart();
          this.createConsumptionTable();
        }
      } else {
        this.meterChartData = [];
        this.meterChartError = "No_Data_For_Selected_Meter";
      }
    } else {
      this.meterChartData = [];
      this.meterChartOptions = {};
      if (dto.message) {
        this.meterChartError = dto.message;
      }
    }
    this.isLoadingMeterChart = false;
  }

  private handleMeterConsumptionError(error: any): void {
    console.error("Error loading meter consumption data:", error);
    if (error.status === 404) {
      this.meterChartError = "Meter_Not_Found";
    } else if (error.status === 403) {
      this.meterChartError = "Access_Denied";
    } else if (error.status === 500) {
      this.meterChartError = "Server_Error";
    } else {
      this.meterChartError = "Error_Loading_Data";
    }
    this.meterChartData = [];
    this.meterChartOptions = {};
    this.isLoadingMeterChart = false;
  }

  // Create table data
  private createConsumptionTable(): void {
    this.dailyConsumptionTable = this.meterChartData.map((record, index) => ({
      date: this.formatDisplayDate(record.date),
      meterReading: record.consumption,
      availableCredit: record.availableCredit,
      dailyUsage: this.calculateDailyUsage(record, index),
    }));
  }

  private transformMeterDataToChart(): void {
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
        backgroundColor: "#ffffff",
        borderRadius: 8,
      },
      title: {
        text: `${this.translate.instant(
          "Daily_Consumption_Chart"
        )} - ${this.translate.instant("Meter")} ${this.selectedMeter?.meterId}`,
        style: {
          fontSize: "20px",
          fontWeight: "bold",
          color: "#2c3e50",
        },
      },
      subtitle: {
        text: `${this.translate.instant("Last")} ${
          this.monthsToShow
        } ${this.translate.instant("Months")} - ${this.translate.instant(
          "Daily_Records"
        )}`,
        style: {
          fontSize: "14px",
          color: "#7f8c8d",
        },
      },
      xAxis: {
        categories: categories,
        title: {
          text: this.translate.instant("Date"),
          style: { fontWeight: "bold", color: "#34495e" },
        },
        labels: {
          rotation: -45,
          style: { fontSize: "10px", color: "#2c3e50" },
        },
        gridLineWidth: 1,
        gridLineColor: "#ecf0f1",
      },
      yAxis: [
        {
          title: {
            text: `${this.translate.instant(
              "Meter_Reading"
            )} (${this.getConsumptionUnit(meterType)})`,
            style: { fontWeight: "bold", color: "#34495e" },
          },
          min: 0,
          labels: {
            formatter: function () {
              return Highcharts.numberFormat(this.value as number, 0, ".", ",");
            },
            style: { color: "#2c3e50" },
          },
          gridLineColor: "#ecf0f1",
        },
        {
          title: {
            text: `${this.translate.instant("Available_Credit")} (EGP)`,
            style: { fontWeight: "bold", color: "#e74c3c" },
          },
          opposite: true,
          min: 0,
          labels: {
            formatter: function () {
              return Highcharts.numberFormat(this.value as number, 0, ".", ",");
            },
            style: { color: "#e74c3c" },
          },
        },
      ],
      series: [
        {
          name: `${this.translate.instant("Meter_Reading")}`,
          type: "line",
          data: meterReadings,
          color: this.getChartColor(meterType),
          yAxis: 0,
          marker: {
            enabled: true,
            radius: 6,
            symbol: "circle",
          },
          lineWidth: 3,
        },
        {
          name: `${this.translate.instant("Available_Credit")}`,
          type: "line",
          data: creditData,
          color: "#e74c3c",
          yAxis: 1,
          marker: {
            enabled: true,
            radius: 6,
            symbol: "circle",
          },
          lineWidth: 3,
        },
      ],
      tooltip: {
        shared: true,
        formatter: function () {
          let tooltip = `<b>${this.x}</b><br/>`;
          this.points?.forEach((point) => {
            const yAxis = point.series.chart.options.yAxis;
            const yAxisTitle = Array.isArray(yAxis)
              ? yAxis[0]?.title?.text
              : yAxis?.title?.text;
            const unit = point.series.name.includes("Credit")
              ? "EGP"
              : yAxisTitle?.match(/\(([^)]+)\)/)?.[1] || "";
            tooltip += `${point.series.name}: <b>${Highcharts.numberFormat(
              point.y as number,
              2
            )}</b> ${unit}<br/>`;
          });
          return tooltip;
        },
        backgroundColor: "#ffffff",
        borderColor: "#cccccc",
        borderRadius: 5,
        shadow: true,
      },
      legend: {
        enabled: true,
        align: "center",
        verticalAlign: "bottom",
        backgroundColor: "#f8f9fa",
        borderRadius: 5,
        padding: 10,
      },
      plotOptions: {
        line: {
          dataLabels: {
            enabled: false,
          },
          animation: {
            duration: 1000,
          },
        },
      },
    };
  }

  private smoothScrollToChart(): void {
    setTimeout(() => {
      if (this.chartSection) {
        this.chartSection.nativeElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }
    }, 200);
  }

  // Helper methods
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
      month: "short",
    });
  }

  private calculateDailyUsage(record: ConsumptionRow, index: number): number {
    if (index > 0) {
      const previousReading = this.meterChartData[index - 1].consumption;
      return Math.max(0, record.consumption - previousReading);
    }
    return 0;
  }

  // Track by function for table performance
  trackByDate(index: number, item: TableRecord): string {
    return item.date;
  }

  // Get CSS class for daily usage
  getDailyUsageClass(usage: number): string {
    if (usage > 100) return "text-danger fw-bold";
    if (usage > 50) return "text-warning fw-bold";
    return "text-success";
  }

  getConsumptionUnit(meterType: string): string {
    switch (meterType) {
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

  private getChartColor(meterType: string): string {
    switch (meterType) {
      case "ELECTRICITY":
        return "#3498db";
      case "GAS":
        return "#e67e22";
      case "WATER":
        return "#1abc9c";
      default:
        return "#95a5a6";
    }
  }

  getIcons(type: string): string {
    if (type === "ELECTRICITY") return "fas fa-bolt";
    else if (type === "GAS") return "fas fa-fire";
    else if (type === "WATER") return "fas fa-tint";
    else return "fas fa-tachometer-alt";
  }

  get Math() {
    return Math;
  }
}
