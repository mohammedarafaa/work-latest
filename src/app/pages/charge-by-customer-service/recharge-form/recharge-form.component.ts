import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { MeterSummery } from '@model/meter.model';
import { TranslateService } from '@ngx-translate/core';
import { PaymentService } from '@service/payment.service';
import { DashboardService } from '@service/services/dashboard.service';
import { LoaderService } from '@service/shared/loader.service';
import { NotificationService } from '@service/shared/notifcation.service';
import { SharedService } from '@service/shared/Shared.service';
import { ApiResponse } from '@model/auth/auth.model';
import { MeterPaymentTransaction } from '@model/meterPaymentTransaction.model';

interface ChargeMeterRequest {
  meterId: number;
  amount: number;
}

@Component({
  selector: 'app-recharge-form',
  templateUrl: './recharge-form.component.html',
  styleUrls: ['./recharge-form.component.scss']
})
export class RechargeFormComponent {
  form: FormGroup = this.fb.group({});
  
  isLoading: boolean = false;
  @Input() currentMeter!:MeterPaymentTransaction;
  
  // Define min and max values
  readonly MIN_AMOUNT = 1;
  readonly MAX_AMOUNT = 10000;

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

    this.MAX_AMOUNT = this.currentMeter?.customer?.maxChargeLimit || 100;
    this.MIN_AMOUNT = this.currentMeter?.customer?.minChargeLimit || 1
  }

  createForm() {
    this.form = this.fb.group({
      meterId: [null],
      amount: [null, [
        Validators.required,
        Validators.min(this.MIN_AMOUNT),
        Validators.max(this.MAX_AMOUNT)
      ]]
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  get amountErrorMessage(): string {
    const control = this.f['amount'];
    if (control.hasError('required')) {
      return this.translate.instant('Amount_Required');
    }
    if (control.hasError('min')) {
      return this.translate.instant('Amount_Min_Error', { min: this.MIN_AMOUNT });
    }
    if (control.hasError('max')) {
      return this.translate.instant('Amount_Max_Error', { max: this.MAX_AMOUNT });
    }
    return '';
  }

  get Math() {
    return Math;
  }

  chargeMeter(){
    if (this.form.valid) {
      this.isLoading = true;
      const chargeData: ChargeMeterRequest = {
        meterId: this.currentMeter.code,
        amount: this.form.get('amount')?.value
      };

      this.paymentService.chargeMeterByCustomerService(chargeData).subscribe({
        next: (response: ApiResponse<any>) => {
          console.log(response);
          
          if (response.status === 200) {
            this.notificationService.SuccessNotification(this.translate.instant('Charge_Success'));
            this.form.reset();
          } else {
            this.notificationService.WaringNotification(this.translate.instant('Charge_Failed'));
          }
        },
        error: (error: Error) => {
          this.notificationService.ErrorNotification(this.translate.instant('Charge_Error'));
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
}
