import { Component, HostListener, OnInit, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ApiResponse } from "@model/auth/auth.model";
import {
  MeterTransactionDTo,
  MeterTransactionFilter,
} from "@model/meterTransaction.model";
import { paging_$Searching } from "@model/Utils/Pagination";
import { getCurrentStatus, getPaymentMethodType } from "@model/Utils/Status";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { AuthenticationService } from "@service/auth/authentication.service";
import { ProfileService } from "@service/profile.service";
import { SharedService } from "@service/shared/Shared.service";
import { DashboardService } from "@service/services/dashboard.service";
import { LoaderService } from "@service/shared/loader.service";
import { NotificationService } from "@service/shared/notifcation.service";
import { Subject, takeUntil } from "rxjs";

@Component({
  selector: "app-meter-transactions-customer",
  templateUrl: "./meter-transactions-customer.component.html",
  styleUrls: ["./meter-transactions-customer.component.scss"],
})
export class MeterTransactionsCustomerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Page state
  isLoading = false;
  dataList: MeterTransactionDTo | null = null;
  paging = new paging_$Searching();
  CurrentFilter: MeterTransactionFilter = {};
  showFilters = false;
  loadingFilters = false;
  isMobile = false;

  // Filter options (all independent)
  compoundsList: any[] = [];
  propertiesList: any[] = [];
  metersList: any[] = [];
  meterTypes = ["GAS", "WATER", "ELECTRICITY"];

  // Pagination
  pageSizeOptions = [8, 16, 24, 32];
  currentPage = 1;

  // Sorting
  currentSortColumn = "";
  isSortAscending = true;

  // Column mapping
  columnMap: { [key: string]: string } = {
    transactionNumber: "Transaction_Number",
    meterSerial: "Meter_Serial",
    amount: "Amount",
    amountCharged: "Amount_Charged",
    status: "Status",
    paymentMethodType: "Payment_Method",
    location: "Location",
    meterType: "Meter_Type",
    transactionDate: "createdAt",
  };
  listOfColumns = Object.keys(this.columnMap);

  // Form
  filterForm: FormGroup;

  constructor(
    private notificationService: NotificationService,
    private modalService: NgbModal,
    private auth: AuthenticationService,
    private profileService: ProfileService,
    private sharedService: SharedService,
    private dashboardService: DashboardService,
    public translate: TranslateService,
    public loaderService: LoaderService,
    private route: ActivatedRoute,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.paging.page = 0;
    this.paging.size = 8;
    this.filterForm = this.fb.group({
      compoundId: [null],
      propertyId: [null],
      meterId: [null],
      meterType: [null],
      startDate: [null],
      endDate: [null],
    });
  }

  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    this.isMobile = window.innerWidth < 768;
  }

  ngOnInit(): void {
    this.isMobile = window.innerWidth < 768;
    this.getData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // === FILTERS =================================================
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
    if (this.showFilters && this.compoundsList.length === 0) {
      this.loadAllFilterOptions();
    }
  }

  private loadAllFilterOptions(): void {
    this.loadingFilters = true;
    this.loadCompoundsFromSharedService();
    this.loadAllPropertiesFromSharedService();
    this.loadMetersFromDashboardService();
  }

  private loadCompoundsFromSharedService(): void {
    this.sharedService.getAllProject().subscribe({
      next: (response: any) => {
        if (response?.status === 200 && response.data) {
          this.compoundsList = response.data.map((p: any) => ({
            id: p.id,
            name: p.name,
          }));
        } else {
          this.compoundsList = [];
        }
        this.checkLoadingComplete();
      },
      error: () => {
        this.compoundsList = [];
        this.checkLoadingComplete();
      },
    });
  }

  private loadAllPropertiesFromSharedService(): void {
    this.sharedService.getAllProperty().subscribe({
      next: (response: any) => {
        if (response?.status === 200 && response.data) {
          this.propertiesList = response.data.map((p: any) => ({
            id: p.id,
            name: p.propertyNo || `Property ${p.id}`,
            compoundId: p.compoundId,
            compoundName: p.compoundName,
          }));
        } else {
          this.propertiesList = [];
        }
        this.checkLoadingComplete();
      },
      error: () => {
        this.propertiesList = [];
        this.checkLoadingComplete();
      },
    });
  }

  private loadMetersFromDashboardService(): void {
    this.dashboardService.getAllMeterList().subscribe({
      next: (response: any) => {
        if (response?.status === 200 && response.data) {
          this.metersList = response.data.map((m: any) => ({
            id: m.meterId,
            serialNumber: m.meterSerial,
            meterType: m.type,
            propertyNo: m.propertyNo,
            block: m.block,
          }));
        } else {
          this.metersList = [];
        }
        this.checkLoadingComplete();
      },
      error: () => {
        this.metersList = [];
        this.checkLoadingComplete();
      },
    });
  }

  private checkLoadingComplete(): void {
    // Very simple check
    this.loadingFilters = false;
  }

  // === PAGINATION ==============================================
  onPageChange(page: number): void {
    this.currentPage = page;
    this.paging.page = page - 1; // Backend is 0-based
    this.getData();
  }

  onPageSizeChange(size: number): void {
    this.paging.size = size;
    this.currentPage = 1;
    this.paging.page = 0;
    this.getData();
  }

  getCurrentPage(): number {
    return this.dataList?.pageable?.pageNumber !== undefined
      ? this.dataList.pageable.pageNumber + 1
      : 1;
  }

  getCurrentPageSize(): number {
    return this.dataList?.pageable?.pageSize || this.paging.size;
  }

  getTotalElements(): number {
    return this.dataList?.totalElements || 0;
  }

  getStartRecord(): number {
    return (this.getCurrentPage() - 1) * this.getCurrentPageSize() + 1;
  }

  getEndRecord(): number {
    return Math.min(
      this.getCurrentPage() * this.getCurrentPageSize(),
      this.getTotalElements()
    );
  }

  shouldShowPagination(): boolean {
    return this.getTotalElements() > this.getCurrentPageSize();
  }

  // === SORTING =================================================
  onSort(column: string): void {
    if (this.currentSortColumn === column) {
      this.isSortAscending = !this.isSortAscending;
    } else {
      this.currentSortColumn = column;
      this.isSortAscending = true;
    }

    // Map frontend column name to backend field
    const backendFieldMap: { [key: string]: string } = {
      transactionDate: "createdAt",
      transactionNumber: "transactionNumber",
      meterSerial: "meterSerial",
      amount: "amount",
      status: "status",
    };
    const backendField = backendFieldMap[column] || column;

    this.paging.sort = backendField;
    this.paging.sortDirection = this.isSortAscending ? "asc" : "desc";
    this.paging.page = 0;
    this.currentPage = 1;
    this.getData();
  }

  getSortIcon(column: string): string {
    if (this.currentSortColumn !== column) return "fa-sort";
    return this.isSortAscending ? "fa-sort-up" : "fa-sort-down";
  }

  // === FILTER APPLICATION =======================================
  applyFilters(): void {
    const formValues = this.filterForm.getRawValue();
    this.CurrentFilter = {};

    if (this.isNotEmpty(formValues.compoundId)) {
      this.CurrentFilter.compoundId = Number(formValues.compoundId);
    }
    if (this.isNotEmpty(formValues.propertyId)) {
      this.CurrentFilter.propertyId = Number(formValues.propertyId);
    }
    if (this.isNotEmpty(formValues.meterId)) {
      this.CurrentFilter.meterId = Number(formValues.meterId);
    }
    if (this.isNotEmpty(formValues.meterType)) {
      const validTypes = ["GAS", "WATER", "ELECTRICITY"];
      if (validTypes.includes(formValues.meterType)) {
        this.CurrentFilter.meterType = formValues.meterType;
      }
    }
    if (this.isNotEmpty(formValues.startDate)) {
      this.CurrentFilter.startDate = formValues.startDate; // ISO string
    }
    if (this.isNotEmpty(formValues.endDate)) {
      this.CurrentFilter.endDate = formValues.endDate; // ISO string
    }

    this.paging.page = 0;
    this.currentPage = 1;
    this.getData();
  }

  resetFilters(): void {
    this.filterForm.reset({
      compoundId: null,
      propertyId: null,
      meterId: null,
      meterType: null,
      startDate: null,
      endDate: null,
    });
    this.CurrentFilter = {};
    this.paging.page = 0;
    this.currentPage = 1;
    this.getData();
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.isNotEmpty(this.CurrentFilter.compoundId)) count++;
    if (this.isNotEmpty(this.CurrentFilter.propertyId)) count++;
    if (this.isNotEmpty(this.CurrentFilter.meterId)) count++;
    if (this.isNotEmpty(this.CurrentFilter.meterType)) count++;
    if (this.isNotEmpty(this.CurrentFilter.startDate)) count++;
    if (this.isNotEmpty(this.CurrentFilter.endDate)) count++;
    return count;
  }

  isNotEmpty<T>(value: T): boolean {
    if (value === undefined || value === null) return false;
    if (typeof value === "string" && value.trim() === "") return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  }

  // === DATA LOADING ============================================
  getData(): void {
    this.isLoading = true;
    this.loaderService.setSpinner(true);

    this.profileService
      .getTransactionHistory(this.paging, this.CurrentFilter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<MeterTransactionDTo>) => {
          if (response?.status === 200) {
            this.dataList = response.data!;
          } else {
            this.notificationService.WaringNotification(
              this.translate.instant("Get_Customer_Error")
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
          this.loaderService.setSpinner(false);
        },
      });
  }

  // === UI HELPERS ==============================================
  getColumnLabel(col: string): string {
    return this.columnMap[col];
  }

  getCurrentStatus(status: string): any {
    const result = getCurrentStatus(status, "TRANSACTION_STATUS");
    return result || { name: status, color: "bg-secondary" };
  }

  getPaymentMethodType(paymentMethod: any): string {
    if (typeof paymentMethod === "string") return paymentMethod;
    if (paymentMethod?.name) return paymentMethod.name;
    if (paymentMethod?.value) return paymentMethod.value;
    return paymentMethod?.toString() ;
  }

  getPaymentMethodColor(paymentMethod: any): string {
    const type = this.getPaymentMethodType(paymentMethod);
    const badgeInfo = getPaymentMethodType(type);
    return badgeInfo?.color || "bg-secondary";
  }

  // Empty methods (for compatibility)
  viewLatestTransactions() {}
  charging() {}
}
