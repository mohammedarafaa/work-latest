import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ApiResponse } from '@model/auth/auth.model';
import { MeterSummery, MeterSummeryDTo } from '@model/meter.model';
import { MeterPaymentTransactionDTo, MeterPaymentTransaction } from '@model/meterPaymentTransaction.model';
import { MeterTransaction, MeterTransactionDTo } from '@model/meterTransaction.model';
import { paging_$Searching } from '@model/Utils/Pagination';
import { TranslateService } from '@ngx-translate/core';
import { PaymentService } from '@service/payment.service';
import { DashboardService } from '@service/services/dashboard.service';
import { LoaderService } from '@service/shared/loader.service';
import { NotificationService } from '@service/shared/notifcation.service';
import { SharedService } from '@service/shared/Shared.service';
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-charing',
  templateUrl: './charing.component.html',
  styleUrls: ['./charing.component.scss']
})
export class CharingComponent implements OnInit {
  form: FormGroup = this.fb.group({});
  selectedCardIndex: number = 0;
  isLoading: boolean = false;
  paging: paging_$Searching = new paging_$Searching();
  filterParam!: URLSearchParams;
  meterTypes = ['GAS', 'WATER', 'ELECTRICITY'];
  isFilter: boolean = false;
  meterList!: MeterSummeryDTo;
  currentMeter!: MeterSummery;
  currentMeterInfo!: any;
  preselectMeterId: string | null = null;
  private shouldAutoFocus = false;

  @ViewChild('amountInput') amountInput!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private paymentService: PaymentService,
    private dashboardService: DashboardService,
    private http: HttpClient,
    private notificationService: NotificationService,
    private translate: TranslateService,
    private router: Router,
    public loaderService: LoaderService,
    private _sharedService: SharedService,
    private route: ActivatedRoute,
    private scroller: ViewportScroller
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const meterId = params['meterId'];
      const autoFocus = params['autoFocus'];
      
      if (meterId) {
        this.shouldAutoFocus = autoFocus === 'true';
        this.pageChange();
        this.preselectMeterId = meterId;
      } else {
        this.pageChange();
      }
    });
  }

  pageChange() {
    this.loaderService.setSpinner(true);
    this.isLoading = true;
    this.getAllMeterSummery();
    this.getAllMeterMinMax();
  }

  getAllMeterSummery() {
    this.dashboardService.getAllMeterFilter(this.paging, this.filterParam).subscribe({
      next: (response: ApiResponse<MeterSummeryDTo>) => {
        if (response.status === 200) {
          this.meterList = response.data!;
          if (this.preselectMeterId) {
            const found = this.meterList.content.find(m => m.meterId == +this.preselectMeterId!);
            if (found) {
              this.chargeMeter(found);
              if (this.shouldAutoFocus) {
                this.focusOnAmountInput();
              }
            }
            this.preselectMeterId = null;
          }
        } else {
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

  getAllMeterMinMax() {
    this.dashboardService.getAllMeterMix_Min().subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.currentMeterInfo = response.data;
        } else {
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

  private focusOnAmountInput(): void {
    setTimeout(() => {
      const amountInput = document.getElementById('amount') as HTMLInputElement;
      if (amountInput) {
        amountInput.focus();
        amountInput.select();
      }
    }, 800);
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  createForm() {
    this.form = this.fb.group({
      meterType: [null],
    });
  }

  createChargingForm() {
    this.form = this.fb.group({
      meterId: [null, Validators.required],
      amount: [0, Validators.required],
    });
  }

  onMeterTypeChange(event: any) {
    if (event) {
      this.filterParam = new URLSearchParams();
      this.filterParam.append('meterType', event);
      this.pageChange();
    } else {
      this.filterParam = new URLSearchParams();
      this.pageChange();
    }
  }

  chargeMeter(meter: MeterSummery) {
    this.currentMeter = meter;
    // Auto-focus on amount input when meter is selected
    setTimeout(() => {
      this.focusOnAmountInput();
    }, 100);
  }

  goBackToMeterList(): void {
    this.currentMeter = null as any;
    // Clear any query parameters
    this.router.navigate(['/Charging']);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getIcons(type: string): string {
    if (type === 'ELECTRICITY') return 'fa fa-bolt';
    else if (type === 'GAS') return 'fas fa-fire';
    else if (type === 'WATER') return 'fas fa-tint';
    else return '';
  }

  get Math() {
    return Math;
  }
}
