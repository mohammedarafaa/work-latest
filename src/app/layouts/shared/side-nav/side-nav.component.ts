import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  Renderer2,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  OnInit,
  HostListener,
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
  @Output() linkClicked = new EventEmitter<void>(); // New event emitter

  @ViewChild("sidebarRef") sidebarRef!: ElementRef;

  appLink!: App_Navigation[];
  currentRoute: string = "";
  isMobile: boolean = false;

  private observer!: MutationObserver;

  constructor(
    public LanguageService: LanguageServiceService,
    private auth: AuthenticationService,
    private renderer: Renderer2
  ) {
    this.checkIfMobile();
  }

  ngOnInit(): void {
    const userAccountType = this.auth.getAccountType();

    this.appLink = APP_LINK.filter((menu) => {
      if (menu.isAuthorize === null) return true;

      return Array.isArray(menu.isAuthorize)
        ? menu.isAuthorize.includes(userAccountType)
        : menu.isAuthorize === userAccountType;
    });
  }

  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    this.checkIfMobile();
  }

  private checkIfMobile(): void {
    this.isMobile = window.innerWidth < 768;
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  toggleSubmenu(clickedNav: App_Navigation): void {
    clickedNav.isCollapse = !clickedNav.isCollapse;
  }

  isActiveLink(nav: string): boolean {
    return nav.toUpperCase() === this.currentRoute.toUpperCase();
  }

  // New method to handle link clicks
  onLinkClick(): void {
    if (this.isMobile) {
      this.linkClicked.emit();
    }
  }
}
