import { Component, OnInit, HostListener } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { Router, NavigationEnd } from "@angular/router";
import { LanguageServiceService } from "@service/shared/language-service.service";
import { filter } from "rxjs";

@Component({
  selector: "app-main-layout",
  templateUrl: "./main-layout.component.html",
  styleUrls: ["./main-layout.component.scss"],
})
export class MainLayoutComponent implements OnInit {
  currentLanguage: string = "";
  isCollapsed = true;
  isMobile = false;
  isTablet = false;
  isMobileMenuOpen = false;
  currentRoute: string = "";

  constructor(
    private router: Router,
    private titleService: Title,
    public LanguageService: LanguageServiceService
  ) {
    this.currentLanguage = this.LanguageService.activeCurrentLanguage;
  }
  private checkScreenSize(): void {
    const width = window.innerWidth;
    this.isMobile = width < 768;
    this.isTablet = width >= 768 && width < 992;

    console.log(
      "Screen size - Width:",
      width,
      "Mobile:",
      this.isMobile,
      "Tablet:",
      this.isTablet
    );
  }
  onChangeCollapsed(eventData: any) {
    this.isCollapsed = eventData.isCollapsed;
  }

  private initializeCollapseState(): void {
    // On mobile/tablet: start collapsed
    // On desktop: start expanded
    if (this.isMobile || this.isTablet) {
      this.isCollapsed = true;
    } else {
      this.isCollapsed = false;
    }

    console.log("Initial collapse state:", this.isCollapsed, "Device type:", {
      mobile: this.isMobile,
      tablet: this.isTablet,
    });
  }

  // Handle collapse state change from navbar

  // Modified method to toggle collapse state on mobile link clicks
  onSideNavLinkClick(): void {
    // Toggle the collapse state: if true, make it false; if false, make it true
    this.isCollapsed = !this.isCollapsed;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  @HostListener("window:resize", ["$event"])
  onResize(event: any): void {
    const wasCollapsed = this.isCollapsed;
    const wasMobile = this.isMobile;
    const wasTablet = this.isTablet;

    this.checkScreenSize();

    // Handle device type transitions
    if (!wasMobile && !wasTablet && (this.isMobile || this.isTablet)) {
      // Switching from desktop to mobile/tablet - collapse sidebar
      console.log("Switching to mobile/tablet - auto-collapsing");
      this.isCollapsed = true;
    } else if ((wasMobile || wasTablet) && !this.isMobile && !this.isTablet) {
      // Switching from mobile/tablet to desktop - expand sidebar
      console.log("Switching to desktop - auto-expanding");
      this.isCollapsed = false;
    }

    console.log("Resize handled - Collapsed:", this.isCollapsed);
  }
  get isDesktop(): boolean {
    return !this.isMobile && !this.isTablet;
  }
  get shouldShowSidebar(): boolean {
    // Show sidebar when:
    // - On desktop and not collapsed
    // - On mobile/tablet and not collapsed (overlay mode)
    return !this.isCollapsed || this.isDesktop;
  }

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (
      this.isMobileMenuOpen &&
      !target.closest(".fixed-sidebar") &&
      !target.closest(".mobile-menu-toggle")
    ) {
      this.closeMobileMenu();
    }
  }

  ngOnInit(): void {
    this.checkScreenSize();
    this.initializeCollapseState();
    this.changeTitle();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeMobileMenu();
        this.currentRoute = this.router.routerState.snapshot.url;
        this.setPageTitle();
      });
  }

  changeTitle() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.currentRoute = this.router.routerState.snapshot.url;
        this.setPageTitle();
      });
  }

  private setPageTitle() {
    const moduleName = this.currentRoute.substring(1).split("/");
    console.log(moduleName);

    if (moduleName.length === 2) {
      this.titleService.setTitle(
        `Madkour Client Dashboard - ${moduleName[0]} Module - ${moduleName[1]}`
      );
    } else if (moduleName.length === 1) {
      this.titleService.setTitle(
        `Madkour Client Dashboard - ${moduleName[0]} Page`
      );
    } else {
      this.titleService.setTitle("Madkour Client Dashboard");
    }
  }
  private initializeMobileCollapse(): void {
    const width = window.innerWidth;
    const isMobile = width < 768;

    if (isMobile) {
      this.isCollapsed = true;

      console.log("Mobile detected: Setting collapsed to true");
    }
  }
}
