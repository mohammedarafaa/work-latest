import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TestComponent } from './test/test.component';
import { HomeComponent } from './home/home.component';
import { MainLayoutComponent } from '@layouts/main-layout/main-layout.component';
import { AuthGuard } from '@service/_helpers/auth.guard';
import { ErrorMainComponent } from './error/error-main/error-main.component';
import { BlankLayoutsComponent } from '@layouts/blank-layouts/blank-layouts.component';
import { ChargeComponent } from './charge/charge.component';
import { ConsumptionHistoryComponent } from './consumption-history/consumption-history.component';
import { MetersComponent } from './meters/meters.component';
// import { DashboardTempComponent } from './dashboard-pages/temp/dashboard-temp/dashboard-temp.component';
// import { DashboardComponent } from './dashboard-pages/temp/dashboard/dashboard.component';
// import { DashboardThreeComponent } from './dashboard-pages/temp/dashboard-three/dashboard-three.component';

import { DashboardMainComponent } from './dashboard-pages/dashboard-main/dashboard-main.component';
import { CustomerComponent } from './customer/customer.component';
import { CustomerFormComponent } from './customer/customer-form/customer-form.component';
import { PropertyComponent } from './property/property.component';
import { PropertyFormComponent } from './property/property-form/property-form.component';
import { ProjectFormComponent } from './project/project-form/project-form.component';
import { ProjectComponent } from './project/project.component';
import { PaymentGetwayFormComponent } from './payment-getway/payment-getway-form/payment-getway-form.component';
import { PaymentGetwayComponent } from './payment-getway/payment-getway.component';
import { MeterSummaryComponent } from './meter-summary/meter-summary.component';
import { MeterTransactionsMainComponent } from './meter-transactions-main/meter-transactions-main.component';
import { FaqsComponent } from './faqs/faqs.component';
import { FaqsFormComponent } from './faqs/faqs-form/faqs-form.component';

import { CharingComponent } from './charing/charing.component';
import { ChargeByCustomerServiceComponent } from './charge-by-customer-service/charge-by-customer-service.component';
import { CibPaymentComponent } from './charing/cib-payment/cib-payment.component';

const routes: Routes = [
  {
    path: "",
    component: BlankLayoutsComponent,
    children: [
      {
        path: "",
        component: HomeComponent,
        data: {
          breadcrumb: null,
        },
      },
    ],
  },
  {
    path: "",
    canActivate: [AuthGuard],
    component: MainLayoutComponent,
    children: [
      { path: "Dashboard", component: DashboardMainComponent },
      // { path: 'Dashboard_1', component: DashboardComponent },
      // { path: 'Dashboard_2', component: DashboardTempComponent },
      // { path: 'Dashboard_3', component: DashboardThreeComponent },
      { path: "Meters_Summary/:type", component: MeterSummaryComponent },

      { path: "Meters", component: MetersComponent },
      { path: "meter-details/:id", component: MetersComponent },
      { path: "Consumption_History", component: ConsumptionHistoryComponent },
      {
        path: "Consumption_History/:meterId/consumption",
        component: ConsumptionHistoryComponent,
      },
      { path: "Charge", component: ChargeComponent },
      // for customer
      { path: "Charging", component: CharingComponent },
      { path: "Charging/:meterId", component: CharingComponent },

      { path: "Charging_", component: ChargeByCustomerServiceComponent },

      { path: "Payment_CIb", component: CibPaymentComponent },

      { path: "test", component: TestComponent },

      {
        path: "Customer",
        children: [
          { path: "", component: CustomerComponent },
          { path: "Create_Customer", component: CustomerFormComponent },
          {
            path: "Update_Customer/:CustomerId",
            component: CustomerFormComponent,
          },
        ],
      },

      {
        path: "Faqs",
        children: [
          { path: "", component: FaqsComponent },
          { path: "Create_Faqs", component: FaqsFormComponent },
          { path: "Update_Faqs/:FaqId", component: FaqsFormComponent },
        ],
      },

      { path: "Meter_Transactions", component: MeterTransactionsMainComponent },

      {
        path: "Property",
        children: [
          { path: "", component: PropertyComponent },
          { path: "Create_Property", component: PropertyFormComponent },
          {
            path: "Update_Property/:PropertyId",
            component: PropertyFormComponent,
          },
        ],
      },
      {
        path: "Project",
        children: [
          { path: "", component: ProjectComponent },
          { path: "Create_Project", component: ProjectFormComponent },
          {
            path: "Update_Project/:ProjectId",
            component: ProjectFormComponent,
          },
        ],
      },
      {
        path: "Payment_Getway",
        children: [
          { path: "", component: PaymentGetwayComponent },
          {
            path: "Create_Payment_Getway",
            component: PaymentGetwayFormComponent,
          },
          {
            path: "Update_Payment_Getway/:PaymentGetwayId",
            component: PaymentGetwayFormComponent,
          },
        ],
      },

      {
        path: "Profile",
        loadChildren: () =>
          import("./profile/profile.module").then((m) => m.ProfileModule),
      },
    ],
  },

  { path: "Error/:errorId", component: ErrorMainComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
