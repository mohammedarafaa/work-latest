import { Component } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl, Validators } from '@angular/forms';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '@service/auth/authentication.service';
import { AlertService } from '@service/shared/alert.service';
import { ProfileService } from '@service/profile.service';
import { error } from 'highcharts';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  form: FormGroup = this.fb.group({});
  isLoading: boolean = false;
  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private notificationService: AlertService,
    private translate: TranslateService
  ) { }
  ngOnInit(): void {
    this.createForm();
  }
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }
  createForm() {
    this.form = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword_Req: ['', Validators.required],
    });
  }
  onUpdatePassword(): void {
    if (this.form.get('newPassword')?.value != this.form.get('confirmPassword_Req')?.value) {
      this.notificationService.ErrorNotification(this.translate.instant('Password_Not_Match'));
      return;
    }

    this.isLoading = true;
    this.profileService.changePassword(this.form.value).subscribe({
      next: (value: any) => {
        if (value.status === 200) {
          this.notificationService.SuccessNotification(this.translate.instant('Update_Password_msg'));
          //add confirmPassword_Req to the form

          this.form.reset();
        } else {
          this.notificationService.ErrorNotification(this.translate.instant(value.code.toString()));
          this.isLoading = false;
        }
      },
      error: (err:any) => {
        this.notificationService.ErrorNotification(this.translate.instant(err.message));
        this.isLoading = false;
      },
      complete: () => (this.isLoading = false),
    })
  }
}
