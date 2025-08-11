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
  isCollapsed = false;
  isMobileMenuOpen = false; // Add this for mobile menu state
  currentRoute: string = "";

  constructor(
    private router: Router,
    private titleService: Title,
    public LanguageService: LanguageServiceService
  ) {
    this.currentLanguage = this.LanguageService.activeCurrentLanguage;
  }

  onChangeCollapsed(eventData: any) {
    this.isCollapsed = eventData.isCollapsed;
  }

  // Mobile menu methods
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  // Close mobile menu when window is resized to desktop size
  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    if (event.target.innerWidth >= 768) {
      this.isMobileMenuOpen = false;
    }
  }

  // Close mobile menu when route changes (optional but good UX)
  @HostListener("document:click", ["$event"])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    // Close mobile menu if clicking outside sidebar on mobile
    if (
      this.isMobileMenuOpen &&
      !target.closest(".fixed-sidebar") &&
      !target.closest(".mobile-menu-toggle")
    ) {
      this.closeMobileMenu();
    }
  }

  ngOnInit(): void {
    this.changeTitle();
    // Close mobile menu on route changes
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeMobileMenu(); // Close mobile menu on navigation
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
  // @HostListener("window:scroll", [])
  // onWindowScroll() {
  //   const hasScrolled = window.pageYOffset > 0;
  //   const isWide = window.innerWidth >= 768;

  //   if (hasScrolled && isWide) {
  //     document.body.classList.add("scrolled");
  //   } else {
  //     document.body.classList.remove("scrolled");
  //   }
  // }

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
}
