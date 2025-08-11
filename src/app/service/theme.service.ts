// theme.service.ts
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { ProfileService } from "@service/profile.service";
import { AlertService } from "@service/shared/alert.service";
import { TranslateService } from "@ngx-translate/core";

@Injectable({
  providedIn: "root",
})
export class ThemeService {
  private isDarkMode = new BehaviorSubject<boolean>(false);
  public isDarkMode$ = this.isDarkMode.asObservable();
  private isLoading = false;

  constructor(
    private profileService: ProfileService,
    private notificationService: AlertService,
    private translate: TranslateService
  ) {
    // Don't initialize theme here - let AuthService handle it after login
    // Only initialize if user is already logged in (page refresh scenario)
    this.initializeThemeForExistingSession();
  }

  private initializeThemeForExistingSession(): void {
    // Only initialize from localStorage if we have a stored theme and user is logged in
    const savedTheme = localStorage.getItem("theme");
    const hasToken = localStorage.getItem("access_token");

    if (savedTheme && hasToken) {
      console.log(
        "ThemeService: Initializing theme for existing session:",
        savedTheme
      );
      const darkMode = savedTheme === "dark";
      this.setDarkMode(darkMode, false);
    } else {
      console.log(
        "ThemeService: No existing session or saved theme, using light mode"
      );
      this.setDarkMode(false, false);
    }
  }

  toggleDarkMode(): void {
    this.setDarkMode(!this.isDarkMode.value, true);
  }

  setDarkMode(isDark: boolean, saveToAPI: boolean = true): void {
    console.log(
      "ThemeService: Setting dark mode to:",
      isDark,
      "saveToAPI:",
      saveToAPI
    );

    this.isDarkMode.next(isDark);
    this.applyTheme(isDark);

    // Only save to localStorage if we have an authenticated user
    if (localStorage.getItem("access_token")) {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    }

    if (saveToAPI) {
      this.saveThemeToAPI(isDark);
    }
  }

  private saveThemeToAPI(isDark: boolean): void {
    if (this.isLoading) return;

    this.isLoading = true;

    const themePayload = {
      appearanceMode: isDark ? "DARK" : "LIGHT",
    };

    this.profileService.updateThemePreference(themePayload).subscribe({
      next: (value: any) => {
        if (value.status === 200) {
          this.notificationService.SuccessNotification(
            this.translate.instant("Theme updated successfully")
          );
        } else {
          this.notificationService.ErrorNotification(value.code);
          this.revertTheme();
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error("ThemeService: Error saving theme:", err);
        this.notificationService.ErrorNotification(
          this.translate.instant("Failed to save theme preference")
        );
        this.revertTheme();
        this.isLoading = false;
      },
    });
  }

  private revertTheme(): void {
    const currentState = this.isDarkMode.value;
    this.setDarkMode(!currentState, false);
  }

  private applyTheme(isDark: boolean): void {
    console.log("ThemeService: Applying theme - isDark:", isDark);

    if (isDark) {
      document.body.classList.add("dark-theme");
      document.documentElement.classList.add("dark-theme");
      document.documentElement.setAttribute("data-bs-theme", "dark");
    } else {
      document.body.classList.remove("dark-theme");
      document.documentElement.classList.remove("dark-theme");
      document.documentElement.setAttribute("data-bs-theme", "light");
    }
  }

  // Method to clear theme (called on logout)
  clearTheme(): void {
    console.log("ThemeService: Clearing theme");
    this.setDarkMode(false, false);
    localStorage.removeItem("theme");
  }

  get currentTheme(): boolean {
    return this.isDarkMode.value;
  }

  get isThemeLoading(): boolean {
    return this.isLoading;
  }
}
