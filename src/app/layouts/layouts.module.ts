import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { FooterComponent } from './shared/footer/footer.component';
import { LoaderComponent } from './shared/loader/loader.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { SideNavComponent } from './shared/side-nav/side-nav.component';
import { RouterModule } from '@angular/router';
import { NgbCollapseModule, NgbDropdownModule, NgbPopoverModule, NgbToastModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { AlertService } from '@service/shared/alert.service';
import { AlertsComponent } from './shared/alerts/alerts.component';
import { SpinnerComponent } from './shared/spinner/spinner.component';
import { BlankLayoutsComponent } from './blank-layouts/blank-layouts.component';
import { FormsModule } from '@angular/forms';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { LandingHeaderComponent } from './shared/landing-header/landing-header.component';
import { LandingFooterComponent } from './shared/landing-footer/landing-footer.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { DeletedModalComponent } from './shared/deleted-modal/deleted-modal.component';
import { ConfirmModelComponent } from './shared/confirm-model/confirm-model.component';

@NgModule({
  declarations: [
    MainLayoutComponent,
    FooterComponent,
    SideNavComponent,
    LoaderComponent,
    AlertsComponent,
    DeletedModalComponent,
    SpinnerComponent,
    NavbarComponent,
    BlankLayoutsComponent,
    LandingHeaderComponent,
    ConfirmModelComponent,
    LandingFooterComponent
  ],
  imports: [
    CommonModule,
    NgScrollbarModule,
    FormsModule,
    RouterModule,
    NgbToastModule,
    TranslateModule,
    NgbPopoverModule,
    NgbCollapseModule,
    NgbTooltipModule,
    NgSelectModule,
    NgbDropdownModule
  ],
  exports: [
    NgbTooltipModule,
    MainLayoutComponent,
    AlertsComponent,
    SpinnerComponent,
    DeletedModalComponent,
    LoaderComponent
  ],
  providers: [AlertService]
})
export class LayoutsModule { }
