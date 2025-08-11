// account-setting.component.ts - Updated to use simplified ThemeService
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { Subject, combineLatest, takeUntil } from "rxjs";

import { ProfileService } from "@service/profile.service";
import { AlertService } from "@service/shared/alert.service";
import { LanguageServiceService } from "@service/shared/language-service.service";
import { ThemeService } from "@service/theme.service";

@Component({
  selector: "app-account-setting",
  templateUrl: "./account-setting.component.html",
  styleUrls: ["./account-setting.component.scss"],
})
export class AccountSettingComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isLoading = true;
  isRTL = false;
  currentLanguageString = "en";
  isDarkMode = false;
  currentTheme: "light" | "dark" = "light";
  isThemeLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private notificationService: AlertService,
    private profileService: ProfileService,
    private translate: TranslateService,
    public languageService: LanguageServiceService,
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.getNotificationData();
    this.subscribeToLanguageDirectionAndThemeChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): void {
    this.form = this.fb.group({
      pushNotifications: [false, Validators.required],
      emailNotifications: [false, Validators.required],
      smsNotifications: [false, Validators.required],
      billReminders: [false, Validators.required],
      usageAlerts: [false, Validators.required],
      appearanceMode: [this.getInitialThemeEnumValue(), Validators.required],
      language: [this.getInitialLanguageEnumValue(), Validators.required],
    });
  }

  private getInitialThemeEnumValue(): string {
    return this.themeService.currentTheme ? "DARK" : "LIGHT";
  }

  private getInitialLanguageEnumValue(): string {
    const currentLang = this.languageService.activeCurrentLanguage;
    return currentLang === "ar" ? "ARABIC" : "ENGLISH";
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  private subscribeToLanguageDirectionAndThemeChanges(): void {
    // Combine all observables for efficient subscription
    combineLatest([
      this.languageService.getLanguageChangedObservable(),
      this.languageService.getDirectionChangedObservable(),
      this.themeService.isDarkMode$,
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([language, direction, isDarkMode]) => {
        console.log("AccountSettings: Language/Direction/Theme changed:", {
          language,
          direction,
          isDarkMode,
        });

        // Update component state
        this.isRTL = direction === "rtl";
        this.currentLanguageString = language;
        this.isDarkMode = isDarkMode;
        this.currentTheme = isDarkMode ? "dark" : "light";
        this.isThemeLoading = this.themeService.isThemeLoading;

        // Update form with enum values
        const enumLanguage = language === "ar" ? "ARABIC" : "ENGLISH";
        const enumTheme = isDarkMode ? "DARK" : "LIGHT";

        this.form.patchValue({
          language: enumLanguage,
          appearanceMode: enumTheme,
        });

        this.cdr.detectChanges();
      });

    // Initialize values
    this.isRTL = this.languageService.isRTL();
    this.currentLanguageString = this.languageService.activeCurrentLanguage;
    this.isDarkMode = this.themeService.currentTheme;
    this.currentTheme = this.isDarkMode ? "dark" : "light";
    this.isThemeLoading = this.themeService.isThemeLoading;
  }

  private setFormValue(data: any): void {
    this.form.patchValue({
      pushNotifications: data.pushNotifications,
      emailNotifications: data.emailNotifications,
      smsNotifications: data.smsNotifications,
      billReminders: data.billReminders,
      usageAlerts: data.usageAlerts,
      appearanceMode: data.appearanceMode || this.getInitialThemeEnumValue(),
      language: data.language || this.getInitialLanguageEnumValue(),
    });
  }

  private getNotificationData(): void {
    this.profileService
      .getNotificationPreferences()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value) => {
          if (value.data) this.setFormValue(value.data);
          this.isLoading = false;
        },
        error: (err) => {
          this.notificationService.ErrorNotification(
            this.translate.instant(`${err}`)
          );
          this.isLoading = false;
        },
      });
  }

  onUpdateSetting(): void {
    if (this.form.invalid) {
      this.notificationService.ErrorNotification(
        this.translate.instant("Please fill all required fields")
      );
      return;
    }

    this.isLoading = true;

    // Handle theme change using simplified service
    const appearanceMode = this.form.value.appearanceMode;
    const currentFormTheme = appearanceMode === "DARK";

    // Only update theme if it's different from current state
    if (currentFormTheme !== this.themeService.currentTheme) {
      console.log(
        "AccountSettings: Theme change detected, updating via simplified service"
      );
      this.themeService.setDarkMode(currentFormTheme, false); // Don't save to API yet, we'll do it in the main update
    }

    // Handle language change
    this.handleLanguageChange(this.form.value.language);

    // Update notification preferences (including theme)
    this.profileService
      .updateNotificationPreferences(this.form.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          if (res.status === 200) {
            this.notificationService.SuccessNotification(
              this.translate.instant(res.message)
            );

            // After successful notification update, also save theme separately if needed
            if (currentFormTheme !== this.isDarkMode) {
              this.themeService.setDarkMode(currentFormTheme, true); // Now save to API
            }
          } else {
            this.notificationService.ErrorNotification(res.code);
            // Revert theme if update failed
            this.themeService.setDarkMode(this.isDarkMode, false);
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.notificationService.ErrorNotification(
            this.translate.instant("Update_Notification_Error")
          );
          // Revert theme if update failed
          this.themeService.setDarkMode(this.isDarkMode, false);
          this.isLoading = false;
        },
      });
  }

  private handleLanguageChange(language: string): void {
    console.log("AccountSettings: Handling language change:", language);

    let langCode = "";
    if (
      language.toLowerCase() === "en" ||
      language.toLowerCase() === "english" ||
      language === "ENGLISH"
    ) {
      langCode = "en";
    } else if (
      language.toLowerCase() === "ar" ||
      language.toLowerCase() === "arabic" ||
      language === "ARABIC"
    ) {
      langCode = "ar";
    }

    if (langCode && langCode !== this.currentLanguageString) {
      console.log(
        "AccountSettings: Sending language code to service:",
        langCode
      );

      this.languageService.toggleLanguage(langCode);

      const enumValue = langCode === "ar" ? "ARABIC" : "ENGLISH";
      this.form.patchValue({ language: enumValue });

      console.log("AccountSettings: Form updated with enum value:", enumValue);
    } else {
      console.warn("AccountSettings: Invalid language provided:", language);
    }
  }

  // Helper method to manually toggle theme (for UI buttons if needed)
  toggleTheme(): void {
    if (!this.isThemeLoading) {
      const newTheme = !this.isDarkMode;
      const enumValue = newTheme ? "DARK" : "LIGHT";

      this.form.patchValue({ appearanceMode: enumValue });
      this.themeService.setDarkMode(newTheme, true);
    }
  }

  // Getter for template use
  get themeButtonText(): string {
    return this.isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode";
  }

  get themeIcon(): string {
    return this.isDarkMode ? "fas fa-sun" : "fas fa-moon";
  }
}
