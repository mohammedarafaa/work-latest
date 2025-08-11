// landing-header.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ChangeDetectorRef,
} from "@angular/core";
import { LanguageServiceService } from "@service/shared/language-service.service";
import { Subject, combineLatest, takeUntil } from "rxjs";
import { AuthenticationService } from "../../../service/auth/authentication.service";
import { ThemeService } from "@service/theme.service";

@Component({
  selector: "app-landing-header",
  templateUrl: "./landing-header.component.html",
  styleUrls: ["./landing-header.component.scss"],
})
export class LandingHeaderComponent implements OnInit, OnDestroy {
  isMenuCollapsed = true;
  isLoggedIn = false;
  isDarkMode = false;
  isThemeLoading = false;
  currentLanguage: string = "en";
  isRTL = false;
  private destroy$ = new Subject<void>();

  private userLoggedInListener = this.onUserLoggedIn.bind(this);
  private userLoggedOutListener = this.onUserLoggedOut.bind(this);

  constructor(
    public languageService: LanguageServiceService,
    private authenticationService: AuthenticationService,
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeLanguageAndDirection();
    // this.initializeLandingTheme();
    this.addScrollOffsetToSections();
    this.isLoggedIn = this.authenticationService.isAuthenticated();
    this.setupAuthenticationWatcher();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.removeCustomEventListeners();
  }

  public checkIsAuthenticated(): boolean {
    return this.authenticationService.isAuthenticated();
  }

  // private initializeLandingTheme(): void {
  //   console.log("LandingHeader: Initializing landing page theme");

  //   this.themeService.isDarkMode$
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe((isDark) => {
  //       console.log(
  //         "LandingHeader: Theme changed to:",
  //         isDark ? "dark" : "light"
  //       );
  //       this.isDarkMode = isDark;
  //       this.updateLandingPageClasses(isDark);
  //       this.cdr.detectChanges();
  //     });

  //   this.themeService.isLoading$
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe((loading) => {
  //       this.isThemeLoading = loading;
  //       this.cdr.detectChanges();
  //     });

  //   this.isDarkMode = this.themeService.isCurrentlyDark;
  //   this.updateLandingPageClasses(this.isDarkMode);
  // }

  private setupAuthenticationWatcher(): void {
    console.log("LandingHeader: Setting up authentication watchers");

    document.addEventListener(
      "userLoggedIn",
      this.userLoggedInListener as EventListener
    );
    document.addEventListener(
      "userLoggedOut",
      this.userLoggedOutListener as EventListener
    );
  }

  private removeCustomEventListeners(): void {
    document.removeEventListener(
      "userLoggedIn",
      this.userLoggedInListener as EventListener
    );
    document.removeEventListener(
      "userLoggedOut",
      this.userLoggedOutListener as EventListener
    );
  }

  private onUserLoggedIn(event: Event): void {
    const customEvent = event as CustomEvent<any>;
    console.log(
      "LandingHeader: User logged in, syncing theme preferences",
      customEvent.detail
    );
    this.isLoggedIn = true;

    // setTimeout(() => {
    //   this.themeService.syncLocalThemeToUserSettings();
    // }, 100);

    this.cdr.detectChanges();
  }

  private onUserLoggedOut(event: Event): void {
    const customEvent = event as CustomEvent<any>;
    console.log(
      "LandingHeader: User logged out, reverting to local theme",
      customEvent.detail
    );
    this.isLoggedIn = false;

    // this.themeService.clearUserThemeAndRevertToLocal();
    this.cdr.detectChanges();
  }

  private updateLandingPageClasses(isDark: boolean): void {
    if (typeof document !== "undefined") {
      const landingContainer = document.querySelector(".landing-container");
      const header = document.querySelector("header");

      if (landingContainer) {
        if (isDark) {
          landingContainer.classList.add("landing-dark");
          landingContainer.classList.remove("landing-light");
        } else {
          landingContainer.classList.add("landing-light");
          landingContainer.classList.remove("landing-dark");
        }
      }

      if (header) {
        if (isDark) {
          header.classList.add("header-dark");
          header.classList.remove("header-light");
        } else {
          header.classList.add("header-light");
          header.classList.remove("header-dark");
        }
      }
    }
  }

  // Using your language service
  private initializeLanguageAndDirection(): void {
    combineLatest([
      this.languageService.getLanguageChangedObservable(),
      this.languageService.getDirectionChangedObservable(),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([language, direction]) => {
        console.log("LandingHeader: Language/Direction changed:", {
          language,
          direction,
        });
        this.currentLanguage = language;
        this.isRTL = direction === "rtl";
        this.cdr.detectChanges();
      });

    this.currentLanguage = this.languageService.activeCurrentLanguage;
    this.isRTL = this.languageService.isRTL();
  }

  private addScrollOffsetToSections(): void {
    setTimeout(() => {
      const sections = document.querySelectorAll("section[id]");
      sections.forEach((section) => {
        section.classList.add("scroll-offset");
      });
    }, 100);
  }

  scrollToSection(elementId: string): void {
    const element = document.getElementById(elementId);
    element?.scrollIntoView({ behavior: "smooth" });
  }

  toggleDarkMode(): void {
    console.log("LandingHeader: Toggling dark mode on landing page");
    if (!this.isThemeLoading) {
      this.themeService.toggleDarkMode();
    }
  }

  navItems = [
    { label: "navLanding.features", section: "features" },
    { label: "navLanding.about", section: "about" },
    { label: "navLanding.contact", section: "contact" },
    { label: "navLanding.login", route: "/Dashboard" },
  ];

  changeLanguage(languageCode: string): void {
    console.log("LandingHeader: Changing language to:", languageCode);
    if (languageCode === "ar" || languageCode === "en") {
      this.languageService.toggleLanguage(languageCode);
      this.isMenuCollapsed = true;
    }
  }

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const navbar = target.closest(".navbar");

    if (!navbar && !this.isMenuCollapsed) {
      this.isMenuCollapsed = true;
    }
  }

  @HostListener("document:keydown.escape")
  onEscapeKey(): void {
    if (!this.isMenuCollapsed) {
      this.isMenuCollapsed = true;
    }
  }

  @HostListener("window:resize")
  onResize(): void {
    if (window.innerWidth >= 992) {
      this.isMenuCollapsed = true;
    }
  }
}
