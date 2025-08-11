import {
  Component,
  Input,
  ElementRef,
  Renderer2,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  OnInit,
} from "@angular/core";

import { APP_LINK, App_Navigation } from "@model/Utils/APP_LINK";
import { AuthenticationService } from "@service/auth/authentication.service";
import { LanguageServiceService } from "@service/shared/language-service.service";

@Component({
  selector: "app-side-nav",
  templateUrl: "./side-nav.component.html",
  styleUrls: ["./side-nav.component.scss"],
})
export class SideNavComponent implements OnInit, OnDestroy {
  @Input() isCollapsed!: boolean;

  @ViewChild("sidebarRef") sidebarRef!: ElementRef;

  appLink!: App_Navigation[];
  currentRoute: string = "";

  private observer!: MutationObserver;

  constructor(
    public LanguageService: LanguageServiceService,
    private auth: AuthenticationService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    const userAccountType = this.auth.getAccountType();

    this.appLink = APP_LINK.filter((menu) => {
      if (menu.isAuthorize === null) return true;

      return Array.isArray(menu.isAuthorize)
        ? menu.isAuthorize.includes(userAccountType)
        : menu.isAuthorize === userAccountType;
    });
  }

  // ngAfterViewInit(): void {
  //   const el = this.sidebarRef.nativeElement;

  //   // Force initial fixed padding
  //   // this.setFixedPadding(el);

  //   // Start watching for unwanted changes
  //   this.observer = new MutationObserver(() => {
  //     // this.setFixedPadding(el); // reset every time it changes
  //   });

  //   this.observer.observe(el, {
  //     attributes: true,
  //     attributeFilter: ["style"],
  //   });
  // }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  // private setFixedPadding(el: HTMLElement): void {
  //   if (el.style.paddingTop !== "70px") {
  //     el.style.setProperty("padding-top", "70px", "important");
  //   }
  // }

  toggleSubmenu(clickedNav: App_Navigation): void {
    clickedNav.isCollapse = !clickedNav.isCollapse;
  }

  isActiveLink(nav: string): boolean {
    return nav.toUpperCase() === this.currentRoute.toUpperCase();
  }
}
