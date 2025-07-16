import { Component } from '@angular/core';

import { AuthenticationService } from '@service/auth/authentication.service';

import { TranslateService } from '@ngx-translate/core';
import { User } from '@model/auth/auth.model';
import { AlertService } from '@service/shared/alert.service';
import { ProfileService } from '@service/profile.service';
import { PersonalInfo } from 'src/app/models/profile.model';
// import { NotificationService } from '@service/shared/notifcation.service';

@Component({
  selector: 'app-view-profile',
  templateUrl: './view-profile.component.html',
  styleUrls: ['./view-profile.component.css']
})
export class ViewProfileComponent {
  currentUser!: PersonalInfo;
  isLoading: boolean = true;
  profileFile?: Blob;
  profileUrl: any;
  constructor(
    private notificationService: AlertService,
    private translate: TranslateService,
    private profileService: ProfileService
  ) { }
  ngOnInit(): void {
    this.isLoading = true;

      this.getProfileData();

  }
  uploadProfilePic() {
    this.isLoading = true;
    const formData = new FormData();

    /*
    formData.append('logo', this.logoFile!);

    this.agentService.addRecord(formData).subscribe({
      next: (value) => {
        if (value.code == 200) {
          this.notificationService.SuccessNotification(
            this.translate.instant('Add_Agent_msg')
          );
        } else {
          this.notificationService.ErrorNotification(this.translate.instant(`${value.message}`));

        }
      },
      error: (err) => {
               this.notificationService.ErrorNotification(this.translate.instant(`${err}`));

        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });*/
  }
  getProfileData() {
    this.profileService.getPersonalInfo().subscribe({
      next: (value) => {
        console.log(value);

        if (value.data) {
          this.currentUser=value.data;
          this.profileService.user = value.data;
        }
        this.isLoading = false;
      },
      error: (err) => {
        //  this.notificationService.ErrorNotification(this.translate.instant(`${err}`);

        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
  onAttachmentSelect(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (event: any) => {
      this.profileUrl = event.target.result;
      this.profileFile = new Blob([file], { type: file });
    };
    reader.onerror = (event: any) => {
      this.notificationService.ErrorNotification(this.translate.instant('Chang'));
    };
    reader.readAsDataURL(event.target.files[0]);
  }
}
