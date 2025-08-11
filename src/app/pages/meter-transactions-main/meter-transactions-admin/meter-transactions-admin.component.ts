import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiResponse } from '@model/auth/auth.model';
import { MeterTransactionDTo } from '@model/meterTransaction.model';
import { paging_$Searching } from '@model/Utils/Pagination';
import { getCurrentStatus, getPaymentMethodType } from '@model/Utils/Status';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '@service/auth/authentication.service';
import { ProfileService } from '@service/profile.service';
import { LoaderService } from '@service/shared/loader.service';
import { NotificationService } from '@service/shared/notifcation.service';
import { SharedService } from '@service/shared/Shared.service';

@Component({
  selector: "app-meter-transactions-admin",
  templateUrl: "./meter-transactions-admin.component.html",
  styleUrls: ["./meter-transactions-admin.component.scss"],
})
export class MeterTransactionsAdminComponent {
  selectedCardIndex: number = 0;
  isLoading!: boolean;
  dataList!: MeterTransactionDTo;
  paging = new paging_$Searching();
  CurrentFilter: any = null;
  listOfColumns: string[] = [
    "transactionNumber",
    "amount",
    "amountCharged",
    "status",
    "paymentMethodType",
    "location",
    "meterType",
    "createdAt",
    // 'action',
  ];
  CustomerId: number = 0;
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

  selectCard(index: number) {
    this.selectedCardIndex = index;
  }

  get Math() {
    return Math;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      console.log("Query Params:", params);

      if (params["CustomerId"]) {
        this.CustomerId = parseInt(params["CustomerId"]);
        console.log("Customer ID:", this.CustomerId);
        this.pageChange();
      } else {
        this.router.navigateByUrl("/Error/404");
        // this.notificationService.WaringNotification(this.translate.instant('Customer_ID_Required'));
      }
    });
  }

  pageChange() {
    this.loaderService.setSpinner(true);
    this.isLoading = true;
    this.getData();
  }

  setCharingLimit(data: any) {}
  viewLatestTransactions(data: any) {}
  getBalance(data: any) {}
  charging(data: any) {}

  getCurrentStatus(status: string) {
    return getCurrentStatus(status, "TRANSACTION_STATUS");
  }
  getPaymentMethodType(name: string) {
    return getPaymentMethodType(name);
  }

  getData() {
    // FIXED: Correct method name (removed the typo 'Bt')
    this.profileService
      .getTransactionHistoryByCustomerId(
        this.CustomerId,
        this.paging,
        this.CurrentFilter
      )
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
        error: (err: any) => {
          // FIXED: Added proper typing
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

  currentSortColumn: string = "";
  isSortAscending: boolean = true;

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
}
  