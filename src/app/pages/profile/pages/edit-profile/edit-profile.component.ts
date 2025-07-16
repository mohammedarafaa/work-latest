import { Component } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl, Validators } from '@angular/forms';
import { User } from '@model/auth/auth.model';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '@service/shared/alert.service';
import { ProfileService } from '@service/profile.service';
import { PersonalInfo } from 'src/app/models/profile.model';
import { SharedService } from '@service/shared/Shared.service';
// import { NotificationService } from '@service/shared/notifcation.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent {
  currentUser!: PersonalInfo;
  form: FormGroup = this.fb.group({});
_isLoading: boolean = false;
  isLoading: boolean = false;
  constructor(
    private profileService: ProfileService,
    private fb: FormBuilder,
    private shared: SharedService,
    private notificationService: AlertService,
    private translate: TranslateService,
  ) {



  }
   get f(): { [key: string]: AbstractControl } {
      return this.form.controls;
    }
  ngOnInit(): void {

    this.getProfileData();
    this.createForm();

  }
    createForm() {
      this.form = this.fb.group({
        email: ['', [Validators.required,Validators.email]],
        phoneNumber: ['', [Validators.required, Validators.pattern('(01)[0125][0-9 ]{8}')]],
        username: [ '', Validators.required],
        fullName: [ '', Validators.required],


      });
    }

    setFormValue(UpdatedItem:any){
      this.f['email'].setValue(UpdatedItem.email);
      this.f['phoneNumber'].setValue(UpdatedItem.phoneNumber);
      this.f['fullName'].setValue(UpdatedItem.fullName);
      this.f['username'].setValue(UpdatedItem.username);


    }
  getProfileData() {


    this.profileService.getPersonalInfo().subscribe({
      next: (value) => {
        console.log(value);

        if (value) {
          this.currentUser = value.data;
          this.profileService.user = value.data;
          this.setFormValue(this.currentUser);

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
  onUpdateProfie(){
    this.isLoading = true;
        this.profileService.editProfile(this.form.value).subscribe({
      next: (value: any) => {
        console.log(value);

        if (value.code === 200) {
          this.notificationService.SuccessNotification(this.translate.instant('Update_Profile_msg'));
              // this.form.reset();
        } else {
          this.notificationService.ErrorNotification(value.code);
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.notificationService.ErrorNotification(this.translate.instant('Update_Profile_Error'));

        this.isLoading = false;
      },
      complete: () => (this.isLoading = false),
    });
  }
}
