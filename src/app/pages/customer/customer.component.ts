import { HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmModelComponent } from '@layouts/shared/confirm-model/confirm-model.component';
import { DeletedModalComponent } from '@layouts/shared/deleted-modal/deleted-modal.component';
import { ApiResponse } from '@model/auth/auth.model';
import { Customer, CustomerDTo } from '@model/customer';
import { ModelOperation } from '@model/Utils/ModelOperation';
import { paging_$Searching } from '@model/Utils/Pagination';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '@service/auth/authentication.service';
import { CustomerService } from '@service/customer.service';
import { LoaderService } from '@service/shared/loader.service';
import { NotificationService } from '@service/shared/notifcation.service';
import { SharedService } from '@service/shared/Shared.service';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ChargeLimitFormComponent } from './charge-limit-form/charge-limit-form.component';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent {

  CurrentFilter: any = null;
  isFilter: boolean = false;
  filterParam!: URLSearchParams;

  isLoading = true;
  paging = new paging_$Searching();
  pageTitle: string = "Customer"
  listOfColumns: string[] = ['name', 'email', 'contact', 'nationalId', 'nationalIdAddress', 'erpCode', 'Action'];
  dataList!: CustomerDTo;
  exportDataList!: any[];
  selectedColumns!: { [key: string]: boolean };
  exportType: 'Excel' | 'PDF' | 'Print' = 'Excel'; // To track the export type
  filterParamString: any[][] = [];

  constructor(
    private notificationService: NotificationService,
    private modalService: NgbModal,
    public translate: TranslateService,
    public loaderService: LoaderService,
    private auth: AuthenticationService,
    private _customerService: CustomerService,
    private route: ActivatedRoute,
    public shared:SharedService,
    private router: Router,

  ) { }
  ngOnInit(): void {

    this.pageChange();

  }

  getCreationRoute() {
    this.router.navigate(['/Customer/Create_Customer']);
  }
  navigateToEditPage(customerId: number) {
    this.router.navigate(['/Customer/Update_Customer', customerId]);
  }
  navigateToProfilePage(customerId: number) {
    this.router.navigate(['/Customer/Customer_Profile', customerId]);
  }
  setCurrentFilter(current: any) {
    current.id !== "Clear" ? this.CurrentFilter = current : this.CurrentFilter = null;
  }

  pageChange() {

    this.loaderService.setSpinner(true);
    this.isLoading = true;
    this.getData();
  }
  get Math() {
    return Math;
  }
  pagingItemChange($event: paging_$Searching) {
    console.log($event);
    console.log(this.paging);

    this.paging = $event;
    console.log(this.paging);
    this.pageChange();
  }
  isShowingFilter($event: boolean) {
    this.isFilter = $event;
  }
  onSearch(form: any) {
    const temp = Object.entries(form)
      .filter(([_, value]) => value !== undefined && value !== null && value !== "")
      .map(([key, value]) => [key, value]);
    console.log(temp);

    this.filterParam = new URLSearchParams(temp as string[][]);
    console.log(this.filterParam);
    this.filterParamString = temp

    const params = new HttpParams({ fromObject: form });

    this.pageChange()
  }


  onResetPassword(customer:Customer) {
      const modalRef = this.modalService.open(ChangePasswordComponent, {
        size: 'lg',
      });
      const updatedModel = new ModelOperation(
        'Change_Customer_Password',
        true,
        customer
      );
      modalRef.componentInstance.modelData = updatedModel;
      modalRef.componentInstance.isSuccess.subscribe((isSuccess: boolean) => {
        // isSuccess ? this.resetPasswordAction() : null;
      });
   
  }
 
  setChargingLimit(customer:Customer) {
      const modalRef = this.modalService.open(ChargeLimitFormComponent, {
        size: 'lg',
      });
      const updatedModel = new ModelOperation(
        'Change_Charge_Limit',
        true,
        customer
      );
      modalRef.componentInstance.modelData = updatedModel;
      modalRef.componentInstance.isSuccess.subscribe((isSuccess: boolean) => {
        isSuccess ? this.getData() : null;
      });
   
  }
 
  onValidAccount(customer:Customer,isApproved:boolean): void {
    const modalRef = this.modalService.open(ConfirmModelComponent, { centered: true });
    const message = isApproved ?'Account_Confirm' : 'Account_Reject'
    modalRef.componentInstance.modelDescription = this.translate.instant(message);
    // Handle the confirmation
    modalRef.componentInstance.isConfirmed.subscribe((confirmed: boolean) => {
      if (confirmed) {
        isApproved ? this.acceptAccount(customer) : this.rejectAccount(customer);
      }
    });
  }
      acceptAccount(customer:Customer) {
        this._customerService.ActiveAccount(customer.id).subscribe({
          next: (value: any) => {
            if (value.status === 200) {
              this.notificationService.SuccessNotification(this.translate.instant('Customer_Active_msg'));
              this.getData()
            } else {
              this.notificationService.WaringNotification(
                this.translate.instant(value.status.toString())
              );
              this.isLoading = false;
            }
          },
          error: (err) => {
            this.notificationService.ErrorNotification(this.translate.instant(`${err.message}`));
            this.isLoading = false;
          },
          complete: () => (this.isLoading = false),
        });
      }
      rejectAccount(customer:Customer) {
        this._customerService.deActiveAccount(customer.id).subscribe({
          next: (value: any) => {
            if (value.status === 200) {
              this.notificationService.SuccessNotification(this.translate.instant('Customer_Deactive_msg'));  
              this.getData()
            } else {
              this.notificationService.WaringNotification(
                this.translate.instant(value.status.toString())
              );
              this.isLoading = false;
            }
          },
          error: (err) => {
            this.notificationService.ErrorNotification(this.translate.instant(`${err.message}`));
            this.isLoading = false;
          },
          complete: () => (this.isLoading = false),
        });
  }
  getData() {
  this._customerService.getRecordByPaging$Searching(this.paging , this.CurrentFilter)
      .subscribe({
        next: (value: ApiResponse<CustomerDTo>) => {
          if (value) {
            console.log(value);
            if(value.status === 200){
              this.dataList = value.data!;

            }
          } else {
            this.notificationService.WaringNotification(this.translate.instant(`Get_Customer_Error`));
          }
        },
        error: (err) => {
          this.notificationService.ErrorNotification(this.translate.instant(`${err.message}`));
        },
        complete: () => {
          this.isLoading = false;
          this.loaderService.setSpinner(false);
        },
      });
  }


  // Add these properties to your component class
  currentSortColumn: string = '';
  isSortAscending: boolean = true;
  // Add this method to handle sorting
  onSort(column: string) {
    if (this.currentSortColumn === column) {
      // If clicking the same column, toggle the sort direction
      this.isSortAscending = !this.isSortAscending;
    } else {
      // If clicking a new column, default to ascending
      this.currentSortColumn = column;
      this.isSortAscending = true;
    }

    // Update the paging object with sort information
    this.paging.sort = this.currentSortColumn;
    this.paging.sortDirection = this.isSortAscending ? 'asc' : 'desc';

    // Reset to first page when changing sort
    this.paging.page = 1;

    // Trigger data reload
    this.pageChange();
  }

  // Add this method to get sort icon
  getSortIcon(column: string): string {
    if (this.currentSortColumn !== column) {
      return 'fa-sort'; // Default sort icon when not sorted
    }
    return this.isSortAscending ? 'fa-sort-up' : 'fa-sort-down';
  }

}
