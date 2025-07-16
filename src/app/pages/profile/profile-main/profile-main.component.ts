import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { environment } from '@environments/environment';
import { User } from '@model/auth/auth.model';
import { PROFILE_LINK } from '@model/Utils/APP_LINK';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '@service/auth/authentication.service';
import { ProfileService } from '@service/profile.service';
// import { NotificationService } from '@service/shared/notifcation.service';

@Component({
  selector: 'app-profile-main',
  templateUrl: './profile-main.component.html',
  styleUrls: ['./profile-main.component.css']
})
export class ProfileMainComponent {
  form: FormGroup = this.fb.group({});

  currentUser!:User;
  selectedFileUrl: string = '';
  mediaUrl:string = environment.mediaUrl;
  url: string = 'assets/images/avatar.png';
  selectedFile!: File;
  isLoading:boolean = false;
  profileUrl:string ='assets/img/avatar/avatar.png';
  currentLink:string = '/'
  allLinks: any[] = [];
  constructor(
    private fb: FormBuilder,
    private router: Router,
private profileService:ProfileService,
private authService:AuthenticationService,
    // private notificationService: NotificationService,
    private translate: TranslateService
  ) {
    // this.currentUser = this.auth.userValue!;
    // this.currentUser =  new User({ id: 1, username: 'dummy', email: 'dummy@example.com' });
  }

  ngOnInit(): void {
    const userAccountType = this.authService.getAccountType();
    this.allLinks = PROFILE_LINK.filter(menu => {
      // If isAuthorize is null, the menu is accessible to everyone
      if (menu.isAuthorize === null) {
        return true;
      }
      // Check if the user's account type is included in the array of authorized account types
      return Array.isArray(menu.isAuthorize) 
        ? menu.isAuthorize.includes(userAccountType)
        : menu.isAuthorize === userAccountType;
    });
    this.createForm();
    this.currentLink = this.router.url;
    // this.getProfileData();
    // this.getProfilePic();
  }
  createForm() {
    this.form = this.fb.group({

      image: ['', Validators.required],
    });
  }
  getProfileData() {
    this.profileService.getPersonalInfo().subscribe({
      next: (value: any) => {
        console.log(value);

        if (value.data) {
          this.currentUser=value.data;
          this.profileService.user = value.data;
          // this.profileUrl=`${this.mediaUrl}${this.currentUser?.user_image}`;
        } else {
          // Handle error case
        }
      }
      });
  }
getProfilePic(){
if(this.currentUser?.user_image){
  return `${this.mediaUrl}${this.currentUser?.user_image}`
}
   return this.profileUrl ;
}
  onAttachmentSelect(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedFileUrl = e.target.result;
        // this.profileUrl = e.target.result;
      };
      reader.readAsDataURL(file);
      this.selectedFile = file;
      this.onApprove();
    }
  }

  onApprove(): void {
    this.isLoading = true;


const formData = new FormData();

formData.delete('image');
if (this.selectedFile) {
  formData.append('image', this.selectedFile, this.selectedFile.name);
}

    // this.accountService.editProfile(formData).subscribe({
    //   next: (value: any) => {
    //     if (value.data) {
    //       this.notificationService.SuccessNotification(this.translate.instant('Profile Pic Updated Succefully'),'Change Profile Pic');
    //       this.profileUrl = this.selectedFileUrl;
    //       this.auth.updateProfile(value.data.image);
    //       window.location.reload();
    //     } else  {
    //       this.notificationService.WaringNotification(
    //         this.translate.instant('Profile Pic Not Updated Succefully'),'Change Profile Pic'
    //       );
    //       this.isLoading = false;
    //     }
    //   },
    //   error: (err) => {
    //     this.notificationService.ErrorNotification(
    //       this.translate.instant('Profile Pic Not Updated Succefully'),'Change Profile Pic'
    //     );

    //     this.isLoading = false;
    //   },
    //   complete: () => (this.isLoading = false),
    // });
  }

  isActive(routePath: string): boolean {
    return this.router.url == routePath;
  }
}
