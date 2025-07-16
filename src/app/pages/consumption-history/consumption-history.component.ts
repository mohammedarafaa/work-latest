import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
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
import { Subject, takeUntil, BehaviorSubject } from "rxjs";
import { MeterDailyConsumption } from "@model/meter-consumption-history.model";
import { paging_$Searching } from "@model/Utils/Pagination";

interface ConsumptionRow {
  date: string;
  consumption: number;
  availableCredit: number;
  meterType: string;
}

interface TableRecord {
  date: string;
  meterReading: number;
  availableCredit: number;
  dailyUsage: number;
}

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
  meterList: MeterDailyConsumption[] = [];
  selectedMeter: MeterDailyConsumption | null = null;
  meterChartData: ConsumptionRow[] = [];
  meterChartOptions: Highcharts.Options = {};
  isLoadingMeterChart = false;
  meterChartError = "";
  showTableView = false;
  dailyConsumptionTable: TableRecord[] = [];
  private destroy$ = new Subject<void>();

  // Filter functionality for dashboard mode
  form: FormGroup = this.fb.group({});
  paging: paging_$Searching = new paging_$Searching();
  filterParam: URLSearchParams = new URLSearchParams();
  projectList: BehaviorSubject<any> = new BehaviorSubject([]);
  propertyList: BehaviorSubject<any> = new BehaviorSubject([]);
  meterTypes = ["GAS", "WATER", "ELECTRICITY"];
  isLoading = false;
  isApplyingFilters = false;

  constructor(
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
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const meterIdParam = params.get("meterId");
      if (meterIdParam) {
        this.mode = "single";
        this.meterId = +meterIdParam;
        this.loadMeterConsumptionData(this.meterId);
      } else {
        this.mode = "dashboard";
        this.getProjectData();
        this.loadAllMetersConsumption();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

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
      .filter(
        ([_, value]) => value !== undefined && value !== null && value !== ""
      )
      .map(([key, value]) => [key, value]);
    this.filterParam = new URLSearchParams(temp as string[][]);

    // Reload data
    this.loadAllMetersConsumption();
  }

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

  loadAllMetersConsumption(): void {
    this.isLoadingMeterChart = true;
    this.isLoading = true;

    if (this.filterParam) {
      this.dashboardService
        .getAllMeterFilter(this.paging, this.filterParam)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.status === 200 && response.data?.content) {
              this.loadConsumptionForMeters(response.data.content);
            } else {
              this.meterList = [];
              this.selectedMeter = null;
              this.meterChartError = "No_Meters_Found";
              this.isLoadingMeterChart = false;
              this.isLoading = false;
              this.isApplyingFilters = false;
            }
          },
          error: () => {
            this.meterChartError = "Error_Loading_Data";
            this.isLoadingMeterChart = false;
            this.isLoading = false;
            this.isApplyingFilters = false;
          },
        });
    } else {
      this.meterConsumptionService
        .getDailyConsumption(3)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (dto) => {
            this.meterList = dto.data || [];
            if (this.meterList.length > 0) {
              this.selectMeter(this.meterList[0]);
            } else {
              this.selectedMeter = null;
              this.meterChartData = [];
              this.meterChartError = "No_Meters_Found";
            }
            this.isLoadingMeterChart = false;
            this.isLoading = false;
            this.isApplyingFilters = false;
          },
          error: () => {
            this.meterChartError = "Error_Loading_Data";
            this.isLoadingMeterChart = false;
            this.isLoading = false;
            this.isApplyingFilters = false;
          },
        });
    }
  }

  private loadConsumptionForMeters(meterSummaries: any[]): void {
    this.meterConsumptionService
      .getDailyConsumption(3)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (dto) => {
          const filteredMeterIds = meterSummaries.map((m) => m.meterId);
          this.meterList = (dto.data || []).filter((meter) =>
            filteredMeterIds.includes(meter.meterId)
          );

          if (this.meterList.length > 0) {
            this.selectMeter(this.meterList[0]);
          } else {
            this.selectedMeter = null;
            this.meterChartData = [];
            this.meterChartError = "No_Meters_Found";
          }
          this.isLoadingMeterChart = false;
          this.isLoading = false;
          this.isApplyingFilters = false;
        },
        error: () => {
          this.meterChartError = "Error_Loading_Data";
          this.isLoadingMeterChart = false;
          this.isLoading = false;
          this.isApplyingFilters = false;
        },
      });
  }

  loadMeterConsumptionData(meterId: number): void {
    this.isLoadingMeterChart = true;
    this.meterConsumptionService
      .getDailyConsumption(3)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (dto) => {
          const meterData = dto.data?.find((m: any) => m.meterId === meterId);
          if (meterData && meterData.dailyRecords) {
            this.selectMeter(meterData);
          } else {
            this.selectedMeter = null;
            this.meterChartData = [];
            this.meterChartError = "No_Data_For_Selected_Meter";
          }
          this.isLoadingMeterChart = false;
        },
        error: () => {
          this.meterChartError = "Error_Loading_Data";
          this.isLoadingMeterChart = false;
        },
      });
  }

  selectMeter(meter: MeterDailyConsumption): void {
    this.selectedMeter = meter;
    this.meterType = meter.type;
    const sortedRecords = [...meter.dailyRecords].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    this.meterChartData = sortedRecords.map((record) => ({
      date: record.date,
      consumption: record.meterReading,
      availableCredit: record.availableCredit,
      meterType: meter.type,
    }));
    this.transformMeterDataToChart();
    this.createConsumptionTable();
    this.meterChartError = "";
  }

  createConsumptionTable(): void {
    this.dailyConsumptionTable = this.meterChartData.map((record, index) => ({
      date: this.formatDisplayDate(record.date),
      meterReading: record.consumption,
      availableCredit: record.availableCredit,
      dailyUsage: this.calculateDailyUsage(record, index),
    }));
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
      xAxis: { categories },
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
        },
        {
          name: this.translate.instant("Available_Credit"),
          type: "line",
          data: creditData,
          yAxis: 1,
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

  goToDashboard(): void {
    this.router.navigate(["/dashboard"]);
  }

  toggleDataView(viewType: "chart" | "table"): void {
    this.showTableView = viewType === "table";
  }

  trackByDate(index: number, item: TableRecord): string {
    return item.date;
  }

  getDailyUsageClass(usage: number): string {
    if (usage > 100) return "text-danger fw-bold";
    if (usage > 50) return "text-warning fw-bold";
    return "text-success";
  }

  getIcons(type: string): string {
    if (type === "ELECTRICITY") return "fas fa-bolt";
    else if (type === "GAS") return "fas fa-fire";
    else if (type === "WATER") return "fas fa-tint";
    else return "fas fa-tachometer-alt";
  }

  onMeterCardClick(meter: MeterDailyConsumption): void {
    if (this.mode === "dashboard") {
      this.selectMeter(meter);
    }
  }
  goBackToAllMeters() {
    this.router.navigate(["/Meters"]);
  }
  isMeterSelected(meter: MeterDailyConsumption): boolean {
    return this.selectedMeter?.meterId === meter.meterId;
  }
}
