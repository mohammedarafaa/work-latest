import { Component, HostListener } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ApiResponse } from "@model/auth/auth.model";
import { MeterTransactionDTo } from "@model/meterTransaction.model";
import { paging_$Searching } from "@model/Utils/Pagination";
import { getCurrentStatus, getPaymentMethodType } from "@model/Utils/Status";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { AuthenticationService } from "@service/auth/authentication.service";
import { ProfileService } from "@service/profile.service";
import { LoaderService } from "@service/shared/loader.service";
import { NotificationService } from "@service/shared/notifcation.service";
import { SharedService } from "@service/shared/Shared.service";

@Component({
  selector: "app-meter-transactions-customer",
  templateUrl: "./meter-transactions-customer.component.html",
  styleUrls: ["./meter-transactions-customer.component.scss"],
})
export class MeterTransactionsCustomerComponent {
  selectedCardIndex: number = 0;
  isLoading!: boolean;
  dataList!: MeterTransactionDTo;
  paging = new paging_$Searching();
  CurrentFilter: any = null;
  isMobile: boolean = false;
  currentSortColumn: string = "";
  isSortAscending: boolean = true;

  // Map of property names to translation keys
  columnMap: { [key: string]: string } = {
    transactionNumber: "Transaction_Number",
    amount: "Amount",
    amountCharged: "Amount_Charged",
    status: "Status",
    paymentMethodType: "Payment_Method",
    location: "Location",
    meterType: "Meter_Type",
    createdAt: "Created_At",
  };

  // List of actual property names (for sorting)
  listOfColumns: string[] = Object.keys(this.columnMap);

  constructor(
    private notificationService: NotificationService,
    private modalService: NgbModal,
    private auth: AuthenticationService,
    private profileService: ProfileService,
    public translate: TranslateService,
    public loaderService: LoaderService,
    private route: ActivatedRoute,
    public shared: SharedService,
    private router: Router
  ) {}

  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    this.isMobile = window.innerWidth < 768;
  }

  ngOnInit(): void {
    this.isMobile = window.innerWidth < 768;
    this.pageChange();
  }

  getColumnLabel(col: string): string {
    return this.columnMap[col];
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
    if (this.currentSortColumn !== column) return "fa-sort";
    return this.isSortAscending ? "fa-sort-up" : "fa-sort-down";
  }

  pageChange() {
    this.loaderService.setSpinner(true);
    this.isLoading = true;
    this.getData();
  }

  getData() {
    this.profileService
      .getTransactionHistory(this.paging, this.CurrentFilter)
      .subscribe({
        next: (value: ApiResponse<MeterTransactionDTo>) => {
          if (value) {
            if (value.status === 200) {
              this.dataList = value.data!;
            }
          } else {
            this.notificationService.WaringNotification(
              this.translate.instant(`Get_Customer_Error`)
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

  getCurrentStatus(status: string) {
    return getCurrentStatus(status, "TRANSACTION_STATUS");
  }

  getPaymentMethodType(name: string) {
    return getPaymentMethodType(name);
  }

  selectCard(index: number) {
    this.selectedCardIndex = index;
  }

  get Math() {
    return Math;
  }

  setCharingLimit(data: any) {}
  viewLatestTransactions(data: any) {}
  getBalance(data: any) {}
  charging(data: any) {}
}
