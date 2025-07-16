import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileMainComponent } from './profile-main/profile-main.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { EditProfileComponent } from './pages/edit-profile/edit-profile.component';
import { ViewProfileComponent } from './pages/view-profile/view-profile.component';
import { SupportComponent } from './pages/support/support.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { AccountSettingComponent } from './pages/account-setting/account-setting.component';

const routes: Routes = [
  {
    path: '',
    component: ProfileMainComponent,
    children: [
      { path: '', component: ViewProfileComponent },
      { path: 'Edit_Profile', component: EditProfileComponent },
      { path: 'Change_Password', component: ChangePasswordComponent },
      { path: 'Account_Setting', component: AccountSettingComponent },
      { path: 'Payment', component: PaymentComponent },
      { path: 'Support', component: SupportComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
