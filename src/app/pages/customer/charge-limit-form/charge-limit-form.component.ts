import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl, Validators } from '@angular/forms';
import { Customer } from '@model/customer';
import { ModelOperation } from '@model/Utils/ModelOperation';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { CustomerService } from '@service/customer.service';
import { NotificationService } from '@service/shared/notifcation.service';

@Component({
  selector: 'app-charge-limit-form',
  templateUrl: './charge-limit-form.component.html',
  styleUrls: ['./charge-limit-form.component.scss']
})
export class ChargeLimitFormComponent {
  form: FormGroup = this.fb.group({});
  hidePassword: boolean = true;
  @Input() modelData!: ModelOperation;
  @Input() editRecord!: Customer;

  isLoading: boolean = false;
  @Output() isSuccess: EventEmitter<boolean> = new EventEmitter();

  constructor(
    public activeModal: NgbActiveModal,
    private customerService: CustomerService,
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.createForm();
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  createForm() {
    const data: Customer = this.modelData._object;
    this.form = this.fb.group({
      maxChargeLimit: [ data.maxChargeLimit, Validators.required],
      minChargeLimit: [ data.minChargeLimit, Validators.required],
    });
  }

  onSubmitForms() {
    this.onUpdate();
  }


  onUpdate(): void {
    this.isLoading = true;
    console.log(this.modelData._object);
    
    this.customerService.chargingLimit(this.modelData._object.id, this.form.value).subscribe({
      next: (value: any) => {
        console.log(value);

        if (value.status == 200) {
          this.notificationService.SuccessNotification(this.translate.instant('Change_Charge_Limit_msg'));
          this.activeModal.close();
          this.isSuccess.emit(true);
        } else  {
          this.notificationService.WaringNotification(
            this.translate.instant(value.code.toString())
          );
          this.isSuccess.emit(false);
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.notificationService.ErrorNotification(`${err.message}`);
        this.isSuccess.emit(false);
        this.isLoading = false;
      },
      complete: () => (this.isLoading = false),
    });
  }
}
