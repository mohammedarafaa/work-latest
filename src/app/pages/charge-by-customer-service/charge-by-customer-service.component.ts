import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ApiResponse } from '@model/auth/auth.model';
import { MeterSummery, MeterSummeryDTo } from '@model/meter.model';
import { MeterPaymentTransaction, MeterPaymentTransactionDTo } from '@model/meterPaymentTransaction.model';
import { paging_$Searching } from '@model/Utils/Pagination';
import { TranslateService } from '@ngx-translate/core';
import { PaymentService } from '@service/payment.service';
import { DashboardService } from '@service/services/dashboard.service';
import { LoaderService } from '@service/shared/loader.service';
import { NotificationService } from '@service/shared/notifcation.service';
import { SharedService } from '@service/shared/Shared.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-charge-by-customer-service',
  templateUrl: './charge-by-customer-service.component.html',
  styleUrls: ['./charge-by-customer-service.component.scss']
})

  export class ChargeByCustomerServiceComponent {
    form: FormGroup = this.fb.group({});
    selectedCardIndex: number = 0;
    cards = [
      { type: 'Visa', last4: '1234', image: 'assets/img/payment/visa.png' },
      { type: 'MasterCard', last4: '5678', image: 'assets/img/payment/master.png' },
    ];
    isLoading: boolean = false;
    
    projectList: BehaviorSubject<any> = new BehaviorSubject([]);
    propertyList: BehaviorSubject<any> = new BehaviorSubject([]);
    unitsList: BehaviorSubject<any> = new BehaviorSubject([]);
  meterTypes = ['GAS', 'WATER', 'ELCTRICTY'];
  paging:paging_$Searching = new paging_$Searching();
  filterParam!: URLSearchParams;
  meterList!:MeterPaymentTransactionDTo;  
  currentMeter!:MeterPaymentTransaction;
  constructor(
      private fb: FormBuilder,
      public loaderService: LoaderService,
      private dashboardService: DashboardService,
      private sanitizer: DomSanitizer,
      private paymentService:PaymentService,
      private http: HttpClient,
      private notificationService: NotificationService,
      private translate: TranslateService,
      private router: Router,
      private _sharedService: SharedService,
    ) {
      this.createForm();
    }
  ngOnInit(): void {
    this.pageChange();
    this.getProjectData();
    // this.getPropertyData();
  }
 
  getProjectData() {
    this._sharedService.getAllProject().subscribe({
      next: (list: any) => {
        if (list.status === 200) {
          this.projectList.next(list.data);
         
        } else {
          this.notificationService.WaringNotification(this.translate.instant(`Get_Status_Warning`));
        }

      },
      error: (err) => {
        this.notificationService.WaringNotification(this.translate.instant(`Get_Status_Error`));
      },

    });
  }
  getPropertyData(compoundId:string) {
    this._sharedService.getAllPropertyByCompoundId(compoundId).subscribe({
      next: (list: any) => {
        if (list.status === 200) {
          this.propertyList.next(list.data);
          
        } else {
          this.notificationService.WaringNotification(this.translate.instant(`Get_Status_Warning`));
        }

      },
      error: (err) => {
        this.notificationService.WaringNotification(this.translate.instant(`Get_Status_Error`));
      },

    });
  }
    get f(): { [key: string]: AbstractControl } {
      return this.form.controls;
    }
    createForm() {
      this.form = this.fb.group({
        meterType: [null],
        propertyId: [null],
        compoundId: [null],
        
      });
      // this.form.
      this.onChanges();
    }
    onChanges(): void {
      this.form.valueChanges.subscribe(val => {
        console.log(val);
        if(val.compoundId){
          this.getPropertyData(val.compoundId)
        }
        const temp = Object.entries(this.form.value)
        .filter(([_, value]) => value !== undefined && value !== null && value !== "")
        .map(([key, value]) => [key, value]);
      console.log(temp);
  
      this.filterParam = new URLSearchParams(temp as string[][]);
        this.pageChange()
      });
    }
    pageChange() {
      // this.loaderService.setSpinner(false);
      // this.isLoading = false;
      this.loaderService.setSpinner(true);
      this.isLoading = true;
      this.getAllMeterSummery();
    }
    get Math() {
      return Math;
    }
    getAllMeterSummery() {
      this.dashboardService.getAllMeterFilterByCustomer(this.paging , this.filterParam ).subscribe({
        next: (response: ApiResponse<MeterPaymentTransactionDTo>) => {
          if(response.status ===200){
            this.meterList = response.data!
  
          }
         else {
          this.notificationService.WaringNotification(this.translate.instant(`Get_Meter_Error`));
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
     // Select a card
    selectCard(index: number) {
      this.selectedCardIndex = index;
    }
    chargeMeter(meter:MeterPaymentTransaction){
      this.currentMeter = meter;
    }
    
    
  }
  