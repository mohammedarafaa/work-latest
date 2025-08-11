// navbar.component.ts - Enhanced to read theme from API like account settings
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
import { AuthToken } from "@model/auth/auth.model";
import { APP_LINK, App_Navigation } from "@model/Utils/APP_LINK";
import { Notification } from "@model/notification";
import { AuthenticationService } from "@service/auth/authentication.service";
import { LanguageServiceService } from "@service/shared/language-service.service";
import { MqttService } from "@service/shared/mqtt.service";
import { ProfileService } from "@service/profile.service"; // Add this import
import { AlertService } from "@service/shared/alert.service"; // Add this import
import { environment } from "@environments/environment";
import { TranslateService } from "@ngx-translate/core";
import { BehaviorSubject, Subject, combineLatest } from "rxjs";
import { takeUntil } from "rxjs/operators";
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
  isMobile = false;
  isTablet = false;

  searchTerm = "";
  showMobileSearch = false;
  isDarkMode = false;
  isThemeLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private themeService: ThemeService,
    public languageService: LanguageServiceService,
    private authService: AuthenticationService,
    private mqttService: MqttService,
    private profileService: ProfileService, // Add this
    private notificationService: AlertService, // Add this
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.currentUser = this.authService.getAuthUser();
  }

  ngOnInit(): void {
    this.checkScreenSize();
    this.initializeMqtt();
    this.initializeLanguageAndDirection();
    this.initializeNavigation();
    this.loadThemeFromAPI(); // Load theme from API first
  }


  private setThemeFromAPI(isDark: boolean): void {
    console.log("Navbar: Setting theme from API data - isDark:", isDark);

    this.isDarkMode = isDark;

    // Update theme service to match API data (without saving back to API)
    this.themeService.setDarkMode(isDark, false);

    // Apply theme classes to document
    this.applyThemeToDocument(isDark);

    // Update theme icon
    this.themeIconName.next(isDark ? "fas fa-sun" : "fas fa-moon");

    // Initialize theme service subscription after setting initial state
    this.initializeThemeSubscription();

    console.log("Navbar: Theme applied from API - Dark Mode:", isDark);
  }

  private initializeThemeSubscription(): void {
    console.log("Navbar: Initializing theme subscription");

    // Subscribe to theme changes from the service (for manual toggles)
    this.themeService.isDarkMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isDark) => {
        // Only update if different from current state
        if (isDark !== this.isDarkMode) {
          console.log("Navbar: Theme service state changed to:", isDark);

          this.isDarkMode = isDark;
          this.isThemeLoading = this.themeService.isThemeLoading;

          // Apply theme classes to document
          this.applyThemeToDocument(isDark);

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

  private applyThemeToDocument(isDark: boolean): void {
    const htmlElement = this.document.documentElement;
    const bodyElement = this.document.body;

    if (isDark) {
      // Apply dark theme classes
      this.renderer.addClass(htmlElement, "dark-theme");
      this.renderer.addClass(bodyElement, "dark-theme");
      this.renderer.setAttribute(htmlElement, "data-bs-theme", "dark");

      console.log("Navbar: Applied dark theme classes to document");
    } else {
      // Remove dark theme classes
      this.renderer.removeClass(htmlElement, "dark-theme");
      this.renderer.removeClass(bodyElement, "dark-theme");
      this.renderer.setAttribute(htmlElement, "data-bs-theme", "light");

      console.log("Navbar: Applied light theme classes to document");
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

  collapse(): void {
    this.isCollapsed = !this.isCollapsed;
    this.isCollapseChanged.emit({ isCollapsed: this.isCollapsed });
  }

  changeLanguage(languageCode: string): void {
    console.log("Navbar: Changing language to:", languageCode);
    if (languageCode === "ar" || languageCode === "en") {
      this.languageService.toggleLanguage(languageCode);
    } else {
      console.warn("Invalid language code:", languageCode);
    }
  }
  // Update the logout method in navbar.component.ts
  logout(): void {
    console.log("Navbar: User logging out");

    // Disconnect MQTT
    this.mqttService.disconnect();

    // AuthService will handle theme clearing and navigation
    this.authService.logout();

    // Reset navbar state
    this.isDarkMode = false;
    this.isThemeLoading = false;
    this.themeIconName.next("fas fa-moon");

    // Force change detection
    this.cdr.detectChanges();
  }
  // Update the loadThemeFromAPI method to handle unauthenticated users
  private loadThemeFromAPI(): void {
    // Check if user is still authenticated before making API call
    if (!this.authService.isAuthenticated()) {
      console.log("Navbar: User not authenticated, using light theme");
      this.setThemeFromAPI(false);
      return;
    }

    console.log("Navbar: Loading theme preferences from API");
    this.isThemeLoading = true;

    this.profileService
      .getNotificationPreferences()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value) => {
          console.log("Navbar: Theme preferences loaded from API:", value);

          if (value.data) {
            const isDarkTheme = value.data.appearanceMode === "DARK";
            console.log(
              "Navbar: API theme data - appearanceMode:",
              value.data.appearanceMode,
              "isDark:",
              isDarkTheme
            );
            this.setThemeFromAPI(isDarkTheme);
          } else {
            console.log(
              "Navbar: No theme data from API, using default light theme"
            );
            this.setThemeFromAPI(false);
          }

          this.isThemeLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Navbar: Error loading theme preferences:", err);
          this.setThemeFromAPI(false);
          this.isThemeLoading = false;
          this.cdr.detectChanges();
        },
      });
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
              // actionUrl: message.actionUrl || "",
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

  // Theme toggle that updates both local state and saves to API
  toggleDarkMode(): void {
    if (!this.isThemeLoading) {
      console.log(
        "Navbar: Toggling theme via service from:",
        this.isDarkMode,
        "to:",
        !this.isDarkMode
      );
      // Use theme service to toggle and save to API
      this.themeService.toggleDarkMode();
    } else {
      console.log("Navbar: Theme toggle blocked - currently loading");
    }
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

    if (!this.isMobile && !this.isTablet) {
      this.showMobileSearch = false;
    }
  }

  getFlagImagePath(): string {
    return `assets/img/flags/${this.currentLanguage}.png`;
  }

  onImageError(event: any): void {
    event.target.src = "assets/img/flags/en.png";
  }

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

  // Getter for theme status (useful for template debugging)
  get currentThemeStatus(): string {
    return `Dark: ${this.isDarkMode}, Loading: ${this.isThemeLoading}`;
  }

  // Method to reload theme from API (for debugging or refresh)
  reloadTheme(): void {
    console.log("Navbar: Manually reloading theme from API");
    this.loadThemeFromAPI();
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
}
