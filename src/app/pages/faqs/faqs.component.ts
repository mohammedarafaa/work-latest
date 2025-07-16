import { HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmModelComponent } from '@layouts/shared/confirm-model/confirm-model.component';
import { DeletedModalComponent } from '@layouts/shared/deleted-modal/deleted-modal.component';
import { ApiResponse } from '@model/auth/auth.model';
import { FAQ, FAQDTo } from '@model/models/faq.model';
import { paging_$Searching } from '@model/Utils/Pagination';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '@service/auth/authentication.service';
import { FAQService } from '@service/faq.service';
import { LoaderService } from '@service/shared/loader.service';
import { NotificationService } from '@service/shared/notifcation.service';
import { SharedService } from '@service/shared/Shared.service';

@Component({
  selector: 'app-faqs',
  templateUrl: './faqs.component.html',
  styleUrls: ['./faqs.component.scss']
})
export class FaqsComponent {

  CurrentFilter: any = null;
  isFilter: boolean = false;
  filterParam!: URLSearchParams;

  isLoading = true;
  paging = new paging_$Searching();
  pageTitle: string = "FAQ"
  listOfColumns: string[] = ['id', 'question', 'answer', 'Action'];
  dataList!: FAQDTo;
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
    private _FAQService: FAQService,
    private route: ActivatedRoute,
    public shared:SharedService,
    private router: Router,

  ) { }
  ngOnInit(): void {

    this.pageChange();

  }

  getCreationRoute() {
    this.router.navigate(['/Faqs/Create_Faqs']);
  }
  navigateToEditPage(id: number) {
    this.router.navigate(['/Faqs/Update_Faqs', id]);
  }

  setCurrentFilter(current: any) {
    current.id !== "Clear" ? this.CurrentFilter = current : this.CurrentFilter = null;
  }
  setChargingLimit(data:any){}
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


  getData() {
  this._FAQService.getRecordByPaging$Searching(this.paging , this.CurrentFilter)
      .subscribe({
        next: (value: ApiResponse<FAQDTo>) => {
          if (value) {
            console.log(value);
            if(value.status === 200){
              this.dataList = value.data!;

            }
          } else {
            this.notificationService.WaringNotification(this.translate.instant(`Get_FAQ_Error`));
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

  DeleteModal(deleteRecord: FAQ) {
    const modalRef = this.modalService.open(DeletedModalComponent);
    modalRef.componentInstance.modelHeader = 'Delete_Faqs';
    modalRef.componentInstance.modelName = deleteRecord.questionEn;
    modalRef.componentInstance.isDeleted.subscribe((inDeleted: boolean) => {
      if (inDeleted) this.DeleteRecord(deleteRecord);
    });
  }

  DeleteRecord(record: FAQ) {
    this._FAQService.deleteRecord(record.id).subscribe({
      next: () => {
        this.pageChange();
        this.modalService.dismissAll();
        this.notificationService.SuccessNotification(
          `${this.translate.instant('Delete_Faqs_msg')}`
        );
      },
      error: (err) => {
        this.notificationService.ErrorNotification(this.translate.instant(`${err.message}`));
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
