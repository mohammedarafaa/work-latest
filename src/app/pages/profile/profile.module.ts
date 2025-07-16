import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileMainComponent } from './profile-main/profile-main.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ViewProfileComponent } from './pages/view-profile/view-profile.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { EditProfileComponent } from './pages/edit-profile/edit-profile.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { AccountSettingComponent } from './pages/account-setting/account-setting.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { SupportComponent } from './pages/support/support.component';


@NgModule({
  declarations: [
    ProfileMainComponent,
    ViewProfileComponent,
    ChangePasswordComponent,
    EditProfileComponent,
    AccountSettingComponent,
    PaymentComponent,
    SupportComponent,

  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    NgbTooltipModule,
    ProfileRoutingModule
  ]
})
export class ProfileModule { }
