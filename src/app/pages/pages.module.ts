import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BidiModule } from '@angular/cdk/bidi';
import { PagesRoutingModule } from './pages-routing.module';
import { HomeComponent } from './home/home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutsModule } from '@layouts/layouts.module';
import { NgbToastModule, NgbNavModule, NgbModalModule, NgbDropdownModule, NgbTooltipModule, NgbPaginationModule, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
// import { AlertService } from '@service/shared/alert.service';
import { ErrorMainComponent } from './error/error-main/error-main.component';
import { DashboardComponent } from './dashboard-pages/temp/dashboard/dashboard.component';
import { DashboardTempComponent } from './dashboard-pages/temp/dashboard-temp/dashboard-temp.component';
import { MetersComponent } from './meters/meters.component';
import { ConsumptionHistoryComponent } from './consumption-history/consumption-history.component';
import { ChargeComponent } from './charge/charge.component';
import { DashboardThreeComponent } from './dashboard-pages/temp/dashboard-three/dashboard-three.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { DashboardMainComponent } from './dashboard-pages/dashboard-main/dashboard-main.component';
import { StatsCardComponent } from './dashboard-pages/shared/stats-card/stats-card.component';
import { CustomerComponent } from './customer/customer.component';
import { CustomerFormComponent } from './customer/customer-form/customer-form.component';
import { PropertyComponent } from './property/property.component';
import { PropertyFormComponent } from './property/property-form/property-form.component';
import { ProjectComponent } from './project/project.component';
import { ProjectFormComponent } from './project/project-form/project-form.component';
import { PaymentGetwayComponent } from './payment-getway/payment-getway.component';
import { PaymentGetwayFormComponent } from './payment-getway/payment-getway-form/payment-getway-form.component';
import { MeterSummaryComponent } from './meter-summary/meter-summary.component';
import { MeterCardComponent } from './components/meter-card/meter-card.component';
import { AdminDashboardComponent } from './dashboard-pages/dasboard-role/admin-dashboard/admin-dashboard.component';
import { CustomerDashboardComponent } from './dashboard-pages/dasboard-role/customer-dashboard/customer-dashboard.component';
import { UserDashboardComponent } from './dashboard-pages/dasboard-role/user-dashboard/user-dashboard.component';

import { MeterTransactionsMainComponent } from './meter-transactions-main/meter-transactions-main.component';
import { MeterTransactionsCustomerComponent } from './meter-transactions-main/meter-transactions-customer/meter-transactions-customer.component';
import { MeterTransactionsAdminComponent } from './meter-transactions-main/meter-transactions-admin/meter-transactions-admin.component';
import { FaqsComponent } from './faqs/faqs.component';
import { FaqsFormComponent } from './faqs/faqs-form/faqs-form.component';
import { ChargeLimitFormComponent } from './customer/charge-limit-form/charge-limit-form.component';
import { ChangePasswordComponent } from './customer/change-password/change-password.component';
import { CharingComponent } from './charing/charing.component';
import { ChargeByCustomerServiceComponent } from './charge-by-customer-service/charge-by-customer-service.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { CibPaymentComponent } from './charing/cib-payment/cib-payment.component';
import { RechargeFormComponent } from './charge-by-customer-service/recharge-form/recharge-form.component';
import { PaymentSuccessComponent } from './payment-getway/payment-success/payment-success.component';
// import { NotificationService } from '@service/shared/notifcation.service';

@NgModule({
  declarations: [
    HomeComponent,
    ErrorMainComponent,
    DashboardComponent,
    DashboardTempComponent,
    MetersComponent,
    ConsumptionHistoryComponent,
    ChargeComponent,
    DashboardThreeComponent,
    DashboardMainComponent,
    StatsCardComponent,
    CustomerComponent,
    CustomerFormComponent,
    PropertyComponent,
    PropertyFormComponent,
    ProjectComponent,
    ProjectFormComponent,
    PaymentGetwayComponent,
    PaymentGetwayFormComponent,
    MeterSummaryComponent,
    MeterCardComponent,
    AdminDashboardComponent,
    CustomerDashboardComponent,
    UserDashboardComponent,
    MeterTransactionsMainComponent,
    MeterTransactionsCustomerComponent,
    MeterTransactionsAdminComponent,
    FaqsComponent,
    FaqsFormComponent,
    ChargeLimitFormComponent,
    ChangePasswordComponent,
    CharingComponent,
    ChargeByCustomerServiceComponent,
    CibPaymentComponent,
    RechargeFormComponent,
    PaymentSuccessComponent
  ],
  imports: [
    CommonModule,
    NgSelectModule,
    PagesRoutingModule,
    FormsModule,
    BidiModule,
    NgbToastModule,
    ReactiveFormsModule,
    NgbNavModule,
    NgbModalModule,
    TranslateModule,
    LayoutsModule,
    NgbDropdownModule,
    NgbTooltipModule,
    NgbPaginationModule,
    NgbDatepickerModule,
    HighchartsChartModule,
  ],

  exports: [],
  // providers: [AlertService,NgbToast, NotificationService]

})
export class PagesModule { }
