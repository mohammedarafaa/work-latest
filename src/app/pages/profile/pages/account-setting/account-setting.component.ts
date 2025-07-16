import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { TranslateService } from '@ngx-translate/core';
import { ProfileService } from '@service/profile.service';
import { AlertService } from '@service/shared/alert.service';

@Component({
  selector: 'app-account-setting',
  templateUrl: './account-setting.component.html',
  styleUrls: ['./account-setting.component.scss']
})
export class AccountSettingComponent implements OnInit {
  form!: FormGroup;
  isLoading:boolean = true;
  constructor(
    private fb: FormBuilder,
    private notificationService: AlertService,
    private profileService: ProfileService,
    private translate: TranslateService
  ) {

  }
  createForm() {
    this.form = this.fb.group({
      pushNotifications: [ false, Validators.required],
      emailNotifications: [ false, Validators.required],
      smsNotifications: [ false, Validators.required],
      billReminders: [ false, Validators.required],
      usageAlerts: [ false, Validators.required],
      appearanceMode: [ null, Validators.required],
      language: [null, Validators.required]
    });
  }
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }
  ngOnInit(): void {
    // Load user settings from service
    this.createForm();
    this.getNotificationData();
  }
  setFormValue(UpdatedItem:any){
    this.f['pushNotifications'].setValue(UpdatedItem.pushNotifications);
    this.f['emailNotifications'].setValue(UpdatedItem.emailNotifications);
    this.f['smsNotifications'].setValue(UpdatedItem.smsNotifications);
    this.f['billReminders'].setValue(UpdatedItem.billReminders);
    this.f['usageAlerts'].setValue(UpdatedItem.usageAlerts);
    this.f['appearanceMode'].setValue(UpdatedItem.appearanceMode);
    this.f['language'].setValue(UpdatedItem.language);


  }
  getNotificationData() {


    this.profileService.getNotificationPreferences().subscribe({
      next: (value) => {
        console.log(value);

        if (value.data) {
          this.setFormValue(value.data);

        }
        this.isLoading = false;
      },
      error: (err) => {
               this.notificationService.ErrorNotification(this.translate.instant(`${err}`));

        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
  onUpdateSetting(): void {
    this.isLoading = true;
        this.profileService.updateNotificationPreferences(this.form.value).subscribe({
      next: (value: any) => {
        console.log(value);

        if (value.status === 200) {
          this.notificationService.SuccessNotification(this.translate.instant('Update_Notification_msg'));
              // this.form.reset();
        } else {
          this.notificationService.ErrorNotification(value.code);
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.notificationService.ErrorNotification(this.translate.instant('Update_Notification_Error'));

        this.isLoading = false;
      },
      complete: () => (this.isLoading = false),
    });
  }





}
