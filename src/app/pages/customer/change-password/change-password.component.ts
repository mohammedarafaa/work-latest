import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl, Validators } from '@angular/forms';
import { Customer } from '@model/customer';
import { ModelOperation } from '@model/Utils/ModelOperation';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { CustomerService } from '@service/customer.service';
import { NotificationService } from '@service/shared/notifcation.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {
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
      // id: [data.id],
      password: [ '', Validators.required],
    });
  }

  onSubmitForms() {
    this.onUpdate();
  }

  // Function to toggle password visibility
  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
      const inputType = passwordInput.getAttribute('type');
      if (inputType === 'password') {
        passwordInput.setAttribute('type', 'text');
      } else {
        passwordInput.setAttribute('type', 'password');
      }
    }
  }

  onUpdate(): void {
    this.isLoading = true;
    this.customerService.ResetPassword(this.modelData._object.id, this.form.value).subscribe({
      next: (value: any) => {
        console.log(value);

        if (value.status == 200) {
          this.notificationService.SuccessNotification(this.translate.instant('Change_Password_msg'));
          this.notificationService.SuccessNotification(this.translate.instant(value.message));
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
