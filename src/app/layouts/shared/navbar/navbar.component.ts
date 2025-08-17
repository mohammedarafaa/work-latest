// navbar.component.ts - Enhanced with Customer-specific theme handling
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  Inject,
} from "@angular/core";
import { Router } from "@angular/router";
import { AuthToken, AccountType } from "@model/auth/auth.model";
import { APP_LINK, App_Navigation } from "@model/Utils/APP_LINK";
import { Notification } from "@model/notification";
import { AuthenticationService } from "@service/auth/authentication.service";
import { LanguageServiceService } from "@service/shared/language-service.service";
import { MqttService } from "@service/shared/mqtt.service";
import { ProfileService } from "@service/profile.service";
import { AlertService } from "@service/shared/alert.service";
import { environment } from "@environments/environment";
import { TranslateService } from "@ngx-translate/core";
import { BehaviorSubject, Subject, combineLatest, of, timer } from "rxjs";
import {
  takeUntil,
  timeout,
  catchError,
  delay,
  retry,
  switchMap,
  map,
} from "rxjs/operators";
import { ThemeService } from "@service/theme.service";
import { DOCUMENT } from "@angular/common";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Output() isCollapseChanged = new EventEmitter<{ isCollapsed: boolean }>();
  @Input() isCollapsed!: boolean;
  isMobile = false;
  isTablet = false;
  themeIconClass$ = this.themeService.isDarkMode$.pipe(
    map((isDark) => (isDark ? "fas fa-moon" : "fas fa-sun"))
  );
  // Environment-aware configuration with customer-specific settings
  private apiTimeout: number =
    environment.api?.timeout || (environment.production ? 15000 : 8000);
  private themeTimeout: number =
    environment.theme?.loadTimeout || (environment.production ? 12000 : 6000);
  private maxRetries: number =
    environment.api?.retryAttempts || (environment.production ? 3 : 1);
  private currentRetry: number = 0;

  // Customer-specific theme properties
  private isCustomerAccount = false;
  private customerDefaultTheme = "light"; // Default theme for customers
  private allowCustomerThemeToggle = true; // Allow customers to change theme

  currentLanguage: string = "en";
  isRTL = false;
  url: string = "assets/img/avatar/avatar.png";
  currentUser!: AuthToken | null;

  languageList = [
    { name: "English", image: "assets/img/flags/en.png", value: "en" },
    { name: "العربية", image: "assets/img/flags/ar.png", value: "ar" },
  ];

  themeIconName = new BehaviorSubject<string>("fas fa-moon");
  isLight = false;

  notificationList: Notification[] = [];
  unreadNotificationCount = 0;

  appLink: App_Navigation[] = APP_LINK;
  allLinks: any[] = [];
  filteredLinks: any[] = [];

  searchTerm = "";
  showMobileSearch = false;
  isDarkMode = false;
  isThemeLoading = false;
  private destroy$ = new Subject<void>();
  private themeInitialized = false;

  constructor(
    private router: Router,
    private themeService: ThemeService,
    public languageService: LanguageServiceService,
    private authService: AuthenticationService,
    private mqttService: MqttService,
    private profileService: ProfileService,
    private notificationService: AlertService,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.currentUser = this.authService.getAuthUser();
    this.checkAccountType();
  }

  ngOnInit(): void {
    console.log(
      "Navbar: Initializing in",
      environment.production ? "PRODUCTION" : "DEVELOPMENT",
      "mode"
    );
    console.log(
      "Navbar: Customer account:",
      this.isCustomerAccount,
      "Allow theme toggle:",
      this.allowCustomerThemeToggle
    );

    this.checkScreenSize();
    // Commented out MQTT initialization as per your current setup
    // this.initializeMqtt();
    this.initializeCollapseState();
    this.initializeLanguageAndDirection();
    this.initializeNavigation();

    // Initialize theme with customer-specific handling
    if (this.authService.getAccountType() === AccountType.CUSTOMER) {
      this.initializeCustomerAwareTheme();
      this.themeService.isDarkMode$
        .pipe(takeUntil(this.destroy$))
        .subscribe((isDark) => {
          this.isDarkMode = isDark;
          this.cdr.detectChanges();
        });
    }
  }

  // Check if current user is a customer// Check if current user is a customer
  private checkAccountType(): void {
    this.isCustomerAccount =
      this.authService.getAccountType() === AccountType.CUSTOMER;
    console.log(
      "Navbar: Account type check - Is Customer:",
      this.isCustomerAccount
    );
  }

  // navbar.component.ts
  private initializeCollapseState(): void {
    // If parent (MainLayout) provides a state, use it; otherwise, default to collapsed on mobile/tablet
    if (this.isMobile || this.isTablet) {
      this.isCollapsed = true; // Force collapsed on small screens
    } else {
      // On desktop, use the parent's state (default: true from MainLayout)
      this.isCollapsed =
        this.isCollapsed !== undefined ? this.isCollapsed : true;
    }
    console.log("Navbar: Initial collapse state:", this.isCollapsed);
  }

  // Customer-aware theme initialization
  private initializeCustomerAwareTheme(): void {
    console.log("Navbar: Starting customer-aware theme initialization");

    // Set customer-specific default theme
    this.setCustomerDefaultTheme();

    // Load theme from API only if user is authenticated
    if (this.authService.isAuthenticated()) {
      if (this.isCustomerAccount) {
        console.log("Navbar: Loading theme for Customer account");
        this.loadCustomerThemeFromAPI();
      } else {
        console.log("Navbar: Loading theme for non-Customer account");
        this.loadThemeFromAPIWithRetry();
      }
    } else {
      console.log(
        "Navbar: User not authenticated, using customer default theme"
      );
      this.completeThemeInitialization();
    }
  }

  // Set default theme based on customer account type
  private setCustomerDefaultTheme(): void {
    console.log("Navbar: Setting customer-aware default theme");

    let fallbackTheme = environment.theme?.fallbackTheme || "light";

    // Override fallback theme for customers if specified
    if (this.isCustomerAccount) {
      fallbackTheme = this.customerDefaultTheme;
      console.log(
        "Navbar: Using customer-specific default theme:",
        fallbackTheme
      );
    }

    const isDarkFallback = fallbackTheme === "dark";
    this.isDarkMode = isDarkFallback;
    this.isThemeLoading = true;

    // Apply theme immediately to DOM
    this.applyCustomerThemeToDocument(isDarkFallback);
    this.themeIconName.next(isDarkFallback ? "fas fa-sun" : "fas fa-moon");

    // Force immediate change detection
    this.cdr.detectChanges();

    console.log("Navbar: Customer-aware default theme applied:", fallbackTheme);
  }

  // Customer-specific theme loading from API
  private loadCustomerThemeFromAPI(): void {
    console.log("Navbar: Loading theme preferences for Customer account");

    this.profileService
      .getNotificationPreferences()
      .pipe(
        takeUntil(this.destroy$),
        timeout(this.themeTimeout),
        retry(environment.production ? 1 : 0),
        catchError((err) => {
          console.error("Navbar: Customer theme API error:", err);

          // Return customer-specific fallback
          return of({
            data: {
              appearanceMode: this.customerDefaultTheme.toUpperCase(),
            },
          });
        })
      )
      .subscribe({
        next: (value) => {
          this.handleCustomerThemeResponse(value);
        },
        error: (err) => {
          console.error("Navbar: Final customer theme loading error:", err);
          this.completeThemeInitialization();
        },
      });
  }

  // Handle API response specifically for customer accounts
  private handleCustomerThemeResponse(value: any): void {
    console.log("Navbar: Customer theme API response received:", value);

    try {
      let shouldUseDarkTheme = false;

      if (value?.data?.appearanceMode) {
        shouldUseDarkTheme = value.data.appearanceMode === "DARK";
        console.log(
          `Navbar: Customer theme from API - ${value.data.appearanceMode} -> Dark: ${shouldUseDarkTheme}`
        );
      } else {
        console.log("Navbar: No customer theme data, using customer default");
        shouldUseDarkTheme = this.customerDefaultTheme === "dark";
      }

      // Apply customer theme if different from current
      if (shouldUseDarkTheme !== this.isDarkMode) {
        console.log(
          `Navbar: Customer theme changed from ${this.isDarkMode} to ${shouldUseDarkTheme}`
        );
        this.updateCustomerTheme(shouldUseDarkTheme);
      } else {
        console.log("Navbar: Customer theme unchanged, keeping current state");
      }
    } catch (parseError) {
      console.error("Navbar: Error parsing customer theme data:", parseError);
    }

    this.completeThemeInitialization();
  }

  // Update theme specifically for customer accounts
  private updateCustomerTheme(isDark: boolean): void {
    console.log("Navbar: Updating customer theme to:", isDark);

    this.isDarkMode = Boolean(isDark);

    // Update theme service for customers (without saving back to API)
    try {
      this.themeService.setDarkMode(this.isDarkMode, false);
    } catch (error) {
      console.error("Navbar: Error updating customer theme service:", error);
    }

    // Apply customer theme changes to DOM
    this.applyCustomerThemeToDocument(this.isDarkMode);
    this.themeIconName.next(this.isDarkMode ? "fas fa-sun" : "fas fa-moon");

    console.log("Navbar: Customer theme updated successfully");
  }

  // Apply theme to document with customer-specific classes
  private applyCustomerThemeToDocument(isDark: boolean): void {
    try {
      if (!this.document?.documentElement || !this.document?.body) {
        console.error("Navbar: Document elements not available");
        return;
      }

      const htmlElement = this.document.documentElement;
      const bodyElement = this.document.body;

      // Remove existing theme classes
      this.renderer.removeClass(htmlElement, "dark-theme");
      this.renderer.removeClass(bodyElement, "dark-theme");
      this.renderer.removeClass(htmlElement, "light-theme");
      this.renderer.removeClass(bodyElement, "light-theme");
      this.renderer.removeClass(htmlElement, "customer-theme");
      this.renderer.removeClass(bodyElement, "customer-theme");
      this.renderer.removeClass(htmlElement, "customer-dark-theme");
      this.renderer.removeClass(bodyElement, "customer-dark-theme");
      this.renderer.removeClass(htmlElement, "customer-light-theme");
      this.renderer.removeClass(bodyElement, "customer-light-theme");

      if (this.isCustomerAccount) {
        // Add customer-specific class
        this.renderer.addClass(htmlElement, "customer-theme");
        this.renderer.addClass(bodyElement, "customer-theme");
      }

      if (isDark) {
        this.renderer.addClass(htmlElement, "dark-theme");
        this.renderer.addClass(bodyElement, "dark-theme");
        this.renderer.setAttribute(htmlElement, "data-bs-theme", "dark");

        if (this.isCustomerAccount) {
          this.renderer.addClass(htmlElement, "customer-dark-theme");
          this.renderer.addClass(bodyElement, "customer-dark-theme");
        }

        console.log("Navbar: Applied customer dark theme classes");
      } else {
        this.renderer.addClass(htmlElement, "light-theme");
        this.renderer.addClass(bodyElement, "light-theme");
        this.renderer.setAttribute(htmlElement, "data-bs-theme", "light");

        if (this.isCustomerAccount) {
          this.renderer.addClass(htmlElement, "customer-light-theme");
          this.renderer.addClass(bodyElement, "customer-light-theme");
        }

        console.log("Navbar: Applied customer light theme classes");
      }
    } catch (error) {
      console.error(
        "Navbar: Error applying customer theme to document:",
        error
      );
    }
  }

  // Enhanced API loading with retry mechanism (for non-customer accounts)
  private loadThemeFromAPIWithRetry(): void {
    if (!this.authService.isAuthenticated()) {
      console.log("Navbar: User not authenticated, keeping default theme");
      this.completeThemeInitialization();
      return;
    }

    console.log(
      `Navbar: Loading theme from API (attempt ${this.currentRetry + 1}/${
        this.maxRetries + 1
      })`
    );

    this.profileService
      .getNotificationPreferences()
      .pipe(
        takeUntil(this.destroy$),
        timeout(this.themeTimeout),
        retry(environment.production ? 1 : 0), // Only retry in production
        catchError((err) => {
          console.error(
            `Navbar: Theme API error (attempt ${this.currentRetry + 1}):`,
            err
          );

          // Retry logic for production environment
          if (this.currentRetry < this.maxRetries && environment.production) {
            this.currentRetry++;
            console.log(
              `Navbar: Retrying theme API call... (${this.currentRetry}/${this.maxRetries})`
            );

            return timer(1000).pipe(
              takeUntil(this.destroy$),
              switchMap(() => this.profileService.getNotificationPreferences())
            );
          }

          // Return fallback theme data on final failure
          const fallbackTheme = environment.theme?.fallbackTheme || "light";
          console.log(
            "Navbar: Using fallback theme due to API failure:",
            fallbackTheme
          );
          return of({
            data: {
              appearanceMode: fallbackTheme.toUpperCase(),
            },
          });
        })
      )
      .subscribe({
        next: (value) => {
          this.handleThemeAPIResponse(value);
        },
        error: (err) => {
          console.error("Navbar: Final theme loading error:", err);
          this.completeThemeInitialization();
        },
      });
  }

  // Handle the API response for theme data (non-customer accounts)
  private handleThemeAPIResponse(value: any): void {
    console.log("Navbar: Theme API response received:", value);

    try {
      let shouldUseDarkTheme = false;

      if (value?.data?.appearanceMode) {
        shouldUseDarkTheme = value.data.appearanceMode === "DARK";
        console.log(
          `Navbar: Theme from API - ${value.data.appearanceMode} -> Dark: ${shouldUseDarkTheme}`
        );
      } else {
        console.log("Navbar: No valid theme data, keeping fallback");
        const fallback = environment.theme?.fallbackTheme || "light";
        shouldUseDarkTheme = fallback === "dark";
      }

      // Only update if theme actually changed from default
      if (shouldUseDarkTheme !== this.isDarkMode) {
        console.log(
          `Navbar: Theme changed from ${this.isDarkMode} to ${shouldUseDarkTheme}`
        );
        this.updateThemeFromAPI(shouldUseDarkTheme);
      } else {
        console.log("Navbar: Theme unchanged, keeping current state");
      }
    } catch (parseError) {
      console.error("Navbar: Error parsing theme data:", parseError);
    }

    this.completeThemeInitialization();
  }

  // Update theme based on API response (non-customer accounts)
  private updateThemeFromAPI(isDark: boolean): void {
    console.log("Navbar: Updating theme from API to:", isDark);

    this.isDarkMode = Boolean(isDark);

    // Update theme service to match API data (without saving back to API)
    try {
      this.themeService.setDarkMode(this.isDarkMode, false);
    } catch (error) {
      console.error("Navbar: Error updating theme service:", error);
    }

    // Apply theme changes to DOM
    this.applyThemeToDocument(this.isDarkMode);
    this.themeIconName.next(this.isDarkMode ? "fas fa-sun" : "fas fa-moon");

    console.log("Navbar: Theme updated from API successfully");
  }

  // Complete the theme initialization process
  private completeThemeInitialization(): void {
    this.isThemeLoading = false;
    this.currentRetry = 0;
    this.themeInitialized = true;

    // Initialize theme service subscription after API loading is complete
    this.initializeThemeSubscription();

    this.cdr.detectChanges();

    console.log("Navbar: Theme initialization completed - Final state:", {
      isDark: this.isDarkMode,
      loading: this.isThemeLoading,
      initialized: this.themeInitialized,
      isCustomer: this.isCustomerAccount,
    });
  }

  private initializeThemeSubscription(): void {
    if (this.themeInitialized) {
      console.log("Navbar: Theme subscription already initialized, skipping");
      return;
    }

    console.log("Navbar: Initializing theme subscription");

    // Subscribe to theme changes from the service (for manual toggles)
    this.themeService.isDarkMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isDark) => {
        // Only update if different from current state and theme is initialized
        if (isDark !== this.isDarkMode && this.themeInitialized) {
          console.log("Navbar: Theme service state changed to:", isDark);

          this.isDarkMode = isDark;
          this.isThemeLoading = this.themeService.isThemeLoading;

          // Apply theme classes to document
          if (this.isCustomerAccount) {
            this.applyCustomerThemeToDocument(isDark);
          } else {
            this.applyThemeToDocument(isDark);
          }

          // Update theme icon based on current state
          this.themeIconName.next(isDark ? "fas fa-sun" : "fas fa-moon");

          console.log(
            "Navbar: Theme updated - Dark Mode:",
            isDark,
            "Loading:",
            this.isThemeLoading
          );
          this.cdr.detectChanges();
        }
      });
  }

  // Standard DOM theme application (for non-customer accounts)
  private applyThemeToDocument(isDark: boolean): void {
    try {
      if (!this.document?.documentElement || !this.document?.body) {
        console.error("Navbar: Document elements not available");
        return;
      }

      const htmlElement = this.document.documentElement;
      const bodyElement = this.document.body;

      // Remove existing theme classes first
      this.renderer.removeClass(htmlElement, "dark-theme");
      this.renderer.removeClass(bodyElement, "dark-theme");
      this.renderer.removeClass(htmlElement, "light-theme");
      this.renderer.removeClass(bodyElement, "light-theme");

      if (isDark) {
        // Apply dark theme classes
        this.renderer.addClass(htmlElement, "dark-theme");
        this.renderer.addClass(bodyElement, "dark-theme");
        this.renderer.setAttribute(htmlElement, "data-bs-theme", "dark");
        console.log("Navbar: Applied dark theme classes to document");
      } else {
        // Apply light theme classes
        this.renderer.addClass(htmlElement, "light-theme");
        this.renderer.addClass(bodyElement, "light-theme");
        this.renderer.setAttribute(htmlElement, "data-bs-theme", "light");
        console.log("Navbar: Applied light theme classes to document");
      }
    } catch (error) {
      console.error("Navbar: Error applying theme to document:", error);
    }
  }

  ngOnDestroy(): void {
    this.mqttService.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeMqtt(): void {
    this.mqttService.connect();
    this.initializeNotifications();
  }

  private initializeLanguageAndDirection(): void {
    combineLatest([
      this.languageService.getLanguageChangedObservable(),
      this.languageService.getDirectionChangedObservable(),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([language, direction]) => {
        console.log("Navbar: Language/Direction changed:", {
          language,
          direction,
        });
        this.currentLanguage = language;
        this.isRTL = direction === "rtl";
        this.initializeNavigation();
        this.cdr.detectChanges();
      });

    this.currentLanguage = this.languageService.activeCurrentLanguage;
    this.isRTL = this.languageService.isRTL();
  }

  private initializeNavigation(): void {
    const userAccountType = this.authService.getAccountType();
    const links = APP_LINK.filter((menu) => {
      if (menu.isAuthorize === null) return true;
      return Array.isArray(menu.isAuthorize)
        ? menu.isAuthorize.includes(userAccountType)
        : menu.isAuthorize === userAccountType;
    });

    if (links.length > 0) {
      this.translate
        .get(links.map((link) => link.name))
        .pipe(takeUntil(this.destroy$))
        .subscribe((translations) => {
          this.allLinks = links.map((link) => ({
            ...link,
            translatedName: translations[link.name] || link.name,
          }));
          this.filteredLinks = [...this.allLinks];
          this.cdr.detectChanges();
        });
    } else {
      this.allLinks = [];
      this.filteredLinks = [];
    }
  }

  // Enhanced collapse method
  collapse(): void {
    console.log(
      "Navbar: Collapse triggered - Current state:",
      this.isCollapsed,
      "Device: Mobile:",
      this.isMobile,
      "Tablet:",
      this.isTablet
    );

    this.isCollapsed = !this.isCollapsed;
    this.isCollapseChanged.emit({ isCollapsed: this.isCollapsed });

    console.log("Navbar: New collapse state:", this.isCollapsed);
    this.cdr.detectChanges();
  }

  changeLanguage(languageCode: string): void {
    console.log("Navbar: Changing language to:", languageCode);
    if (languageCode === "ar" || languageCode === "en") {
      this.languageService.toggleLanguage(languageCode);
    } else {
      console.warn("Invalid language code:", languageCode);
    }
  }

  // Enhanced logout method
  logout(): void {
    console.log("Navbar: User logging out");

    // Disconnect MQTT
    this.mqttService.disconnect();

    // AuthService will handle theme clearing and navigation
    this.authService.logout();

    // Reset navbar state
    this.isDarkMode = false;
    this.isThemeLoading = false;
    this.themeInitialized = false;
    this.isCustomerAccount = false;
    this.themeIconName.next("fas fa-moon");

    // Force change detection
    this.cdr.detectChanges();
  }

  onSearchPage(searchTerm: any): void {
    this.searchTerm = searchTerm?.term || searchTerm || "";

    if (!this.searchTerm.trim()) {
      this.filteredLinks = [...this.allLinks];
      return;
    }

    this.filteredLinks = this.allLinks.filter(
      (link) =>
        link.translatedName
          ?.toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        link.name?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  onSelectPage(selectedItem: any): void {
    if (selectedItem && selectedItem.href) {
      this.router.navigateByUrl(selectedItem.href);
    }
    this.searchTerm = "";
    this.filteredLinks = [...this.allLinks];
    this.showMobileSearch = false;
  }

  private initializeNotifications(): void {
    this.mqttService
      .getMessages()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res?.payload && Array.isArray(res.payload)) {
          res.payload.forEach((message: any) => {
            const newNotification: Notification = {
              id: message.id || this.generateNotificationId(),
              title: message.title || "New Notification",
              message: message.message || "",
              icon: message.icon || "bell",
              type: message.type || "info",
              timestamp: message.timestamp || new Date().toLocaleString(),
              read: false,
            };

            const existing = this.notificationList.find(
              (n) => n.id === newNotification.id
            );
            if (!existing) {
              this.notificationList.unshift(newNotification);
              this.updateUnreadCount();
              this.cdr.detectChanges();
            }
          });
        }
      });

    this.mqttService.subscribeToTopics(`${environment.Mqqt_Message}1`);
  }

  private generateNotificationId(): string {
    return `notification_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }

  private updateUnreadCount(): void {
    this.unreadNotificationCount = this.notificationList.filter(
      (n) => !n.read
    ).length;
  }

  markAsRead(notification: Notification): void {
    if (!notification.read) {
      notification.read = true;
      this.updateUnreadCount();
      this.cdr.detectChanges();
    }

    if (notification.actionUrl) {
      this.router.navigateByUrl(notification.actionUrl);
    }
  }

  markAllAsRead(): void {
    this.notificationList.forEach((n) => (n.read = true));
    this.updateUnreadCount();
    this.cdr.detectChanges();
  }

  viewAllNotifications(): void {
    this.router.navigate(["/notifications"]);
  }

  removeNotification(notification: Notification): void {
    const index = this.notificationList.findIndex(
      (n) => n.id === notification.id
    );
    if (index > -1) {
      this.notificationList.splice(index, 1);
      this.updateUnreadCount();
      this.cdr.detectChanges();
    }
  }

  clearAllNotifications(): void {
    this.notificationList = [];
    this.updateUnreadCount();
    this.cdr.detectChanges();
  }

  getDropdownPlacement(): string {
    return this.isRTL ? "bottom-start" : "bottom-end";
  }

  toggleMobileSearch(): void {
    this.showMobileSearch = !this.showMobileSearch;
  }

  // Enhanced theme toggle with customer account check
  toggleDarkMode(): void {
    // if (!this.isThemeLoading && this.themeInitialized) {
    //   // Check if customer is allowed to toggle theme
    //   if (this.isCustomerAccount && !this.allowCustomerThemeToggle) {
    //     console.log("Navbar: Theme toggle disabled for Customer accounts");
    //     return;
    //   }

    //   console.log(
    //     "Navbar: Toggling theme via service from:",
    //     this.isDarkMode,
    //     "to:",
    //     !this.isDarkMode,
    //     "Customer:",
    //     this.isCustomerAccount
    //   );

    //   // Use theme service to toggle and save to API
    //   this.themeService.toggleDarkMode();
    // } else {
    //   console.log(
    //     "Navbar: Theme toggle blocked - loading:",
    //     this.isThemeLoading,
    //     "initialized:",
    //     this.themeInitialized
    //   );
    // }
    this.themeService.toggleDarkMode();
  }

  onLogoClick(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();

    const targetRoute = this.authService.isAuthenticated() ? "/Dashboard" : "/";

    if (this.router.url !== targetRoute) {
      this.router.navigate([targetRoute]);
    }
  }
  private checkScreenSize(): void {
    const width = window.innerWidth;
    this.isMobile = width < 768;
    this.isTablet = width >= 768 && width < 992;

    console.log(
      "Navbar: Screen size - Width:",
      width,
      "Mobile:",
      this.isMobile,
      "Tablet:",
      this.isTablet
    );
  }

  @HostListener("window:resize", ["$event"])
  onResizer(event: any): void {
    const wasMobile = this.isMobile;
    const wasTablet = this.isTablet;
    this.checkScreenSize();

    // Auto-collapse on mobile/tablet, regardless of previous state
    if (this.isMobile || this.isTablet) {
      if (!this.isCollapsed) {
        this.isCollapsed = true;
        this.isCollapseChanged.emit({ isCollapsed: this.isCollapsed });
      }
    }

    this.cdr.detectChanges();
  }
  getFlagImagePath(): string {
    return `assets/img/flags/${this.currentLanguage}.png`;
  }

  onImageError(event: any): void {
    event.target.src = "assets/img/flags/en.png";
  }

  // Getters
  get isArabic(): boolean {
    return this.currentLanguage === "ar";
  }

  get isEnglish(): boolean {
    return this.currentLanguage === "en";
  }

  get hasUnreadNotifications(): boolean {
    return this.unreadNotificationCount > 0;
  }

  get displayNotificationCount(): string {
    return this.unreadNotificationCount > 99
      ? "99+"
      : this.unreadNotificationCount.toString();
  }

  // Getter to check if theme toggle should be visible for customers
  get shouldShowThemeToggle(): boolean {
    if (!this.isCustomerAccount) {
      return true; // Always show for non-customers
    }
    return this.allowCustomerThemeToggle; // Show based on customer setting
  }

  // Getter for customer-specific theme classes
  get customerThemeClass(): string {
    if (!this.isCustomerAccount) {
      return "";
    }

    let classes = "customer-account";
    if (this.isDarkMode) {
      classes += " customer-dark-mode";
    } else {
      classes += " customer-light-mode";
    }
    return classes;
  }

  // Enhanced getter for theme status (useful for template debugging)
  get currentThemeStatus(): string {
    return `Dark: ${this.isDarkMode}, Loading: ${this.isThemeLoading}, Init: ${this.themeInitialized}, Customer: ${this.isCustomerAccount}`;
  }

  // Enhanced method to reload theme from API
  reloadTheme(): void {
    console.log("Navbar: Manually reloading theme from API");
    this.currentRetry = 0;
    this.themeInitialized = false;
    this.initializeCustomerAwareTheme();
  }

  // Environment info getter for debugging
  get environmentInfo(): any {
    return {
      production: environment.production,
      apiUrl: environment.apiUrl,
      themeTimeout: this.themeTimeout,
      apiTimeout: this.apiTimeout,
      maxRetries: this.maxRetries,
      currentRetry: this.currentRetry,
      isCustomer: this.isCustomerAccount,
      allowCustomerThemeToggle: this.allowCustomerThemeToggle,
    };
  }

  @HostListener("window:resize", [])
  onResize(): void {
    this.checkScreenSize();
  }

  @HostListener("keydown", ["$event"])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape" && this.showMobileSearch) {
      this.showMobileSearch = false;
      event.preventDefault();
    }
  }

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const searchContainer = target.closest(".navbar-mobile-search");
    const searchToggle = target.closest(".mobile-search-toggle");

    if (!searchContainer && !searchToggle && this.showMobileSearch) {
      this.showMobileSearch = false;
    }
  }

  trackByNotificationId(index: number, notification: Notification): any {
    return notification.id;
  }

  trackByLinkName(index: number, link: any): any {
    return link.name || link.href;
  }
  showThemeToggler(): boolean {
    return this.authService.getAccountType() === "CUSTOMER";
  }
}
