import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";

// NgBootstrap modules
import {
  NgbCollapseModule,
  NgbDropdownModule,
  NgbPopoverModule,
  NgbToastModule,
  NgbTooltipModule,
} from "@ng-bootstrap/ng-bootstrap";

// Third-party modules
import { TranslateModule } from "@ngx-translate/core";
import { NgScrollbarModule } from "ngx-scrollbar";
import { NgSelectModule } from "@ng-select/ng-select";

// Layout components
import { MainLayoutComponent } from "./main-layout/main-layout.component";
import { BlankLayoutsComponent } from "./blank-layouts/blank-layouts.component";

// Shared components
import { FooterComponent } from "./shared/footer/footer.component";
import { LoaderComponent } from "./shared/loader/loader.component";
import { NavbarComponent } from "./shared/navbar/navbar.component";
import { SideNavComponent } from "./shared/side-nav/side-nav.component";
import { AlertsComponent } from "./shared/alerts/alerts.component";
import { SpinnerComponent } from "./shared/spinner/spinner.component";
import { LandingHeaderComponent } from "./shared/landing-header/landing-header.component";
import { LandingFooterComponent } from "./shared/landing-footer/landing-footer.component";
import { DeletedModalComponent } from "./shared/deleted-modal/deleted-modal.component";
import { ConfirmModelComponent } from "./shared/confirm-model/confirm-model.component";

// Services
import { AlertService } from "@service/shared/alert.service";

@NgModule({
  declarations: [
    // Layout components
    MainLayoutComponent,
    BlankLayoutsComponent,

    // Shared components
    FooterComponent,
    SideNavComponent,
    LoaderComponent,
    AlertsComponent,
    DeletedModalComponent,
    SpinnerComponent,
    NavbarComponent,
    LandingHeaderComponent,
    LandingFooterComponent,
    ConfirmModelComponent,
  ],
  imports: [
    // Angular modules
    CommonModule,
    RouterModule,
    FormsModule,

    // Third-party modules
    NgScrollbarModule,
    TranslateModule,
    NgSelectModule,

    // NgBootstrap modules
    NgbToastModule,
    NgbPopoverModule,
    NgbCollapseModule,
    NgbTooltipModule,
    NgbDropdownModule,
  ],
  exports: [
    // Export layout components for use in other modules
    MainLayoutComponent,
    BlankLayoutsComponent,

    // Export shared components
    AlertsComponent,
    SpinnerComponent,
    DeletedModalComponent,
    LoaderComponent,
    NavbarComponent,
    LandingHeaderComponent,
    LandingFooterComponent,

    // Export NgBootstrap modules for use in other modules
    NgbTooltipModule,
    NgbDropdownModule,
    NgbCollapseModule,
  ],
  providers: [AlertService],
})
export class LayoutsModule {}
