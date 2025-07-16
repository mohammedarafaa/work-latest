import { Component, OnInit, Inject, OnDestroy } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { Subject, takeUntil } from "rxjs";

import { ProfileService } from "@service/profile.service";
import { AlertService } from "@service/shared/alert.service";
import { LanguageServiceService } from "@service/shared/language-service.service";

@Component({
  selector: "app-account-setting",
  templateUrl: "./account-setting.component.html",
  styleUrls: ["./account-setting.component.scss"],
})
export class AccountSettingComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isLoading: boolean = true;
  private destroy$ = new Subject<void>();

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private fb: FormBuilder,
    private notificationService: AlertService,
    private profileService: ProfileService,
    private translate: TranslateService,
    private languageService: LanguageServiceService
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.getNotificationData();
    this.subscribeToLanguageChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToLanguageChanges(): void {
    this.languageService.getLanguageChangedObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe((lang: string) => {
        // Update form language value when language changes externally
        if (this.form) {
          this.form.patchValue({
            language: lang === "ar" ? "Arabic" : "English",
          });
        }
      });
  }

  createForm(): void {
    this.form = this.fb.group({
      pushNotifications: [false, Validators.required],
      emailNotifications: [false, Validators.required],
      smsNotifications: [false, Validators.required],
      billReminders: [false, Validators.required],
      usageAlerts: [false, Validators.required],
      appearanceMode: [null, Validators.required],
      language: [null, Validators.required],
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  setFormValue(updatedItem: any): void {
    this.form.patchValue({
      pushNotifications: updatedItem.pushNotifications,
      emailNotifications: updatedItem.emailNotifications,
      smsNotifications: updatedItem.smsNotifications,
      billReminders: updatedItem.billReminders,
      usageAlerts: updatedItem.usageAlerts,
      appearanceMode: updatedItem.appearanceMode,
      language: updatedItem.language,
    });
  }

  getNotificationData(): void {
    this.profileService
      .getNotificationPreferences()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value) => {
          console.log(value);
          if (value.data) {
            this.setFormValue(value.data);
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.notificationService.ErrorNotification(
            this.translate.instant(`${err}`)
          );
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  applyTheme(theme: string): void {
    if (theme === "DARK") {
      this.document.body.classList.add("dark-theme");
      this.document.documentElement.classList.add("dark-theme");
    } else {
      this.document.body.classList.remove("dark-theme");
      this.document.documentElement.classList.remove("dark-theme");
    }
  }

  onUpdateSetting(): void {
    if (this.form.invalid) {
      this.notificationService.ErrorNotification(
        this.translate.instant("Please fill all required fields")
      );
      return;
    }

    this.isLoading = true;

    this.profileService
      .updateNotificationPreferences(this.form.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value: any) => {
          console.log(value);

          if (value.status === 200) {
            this.notificationService.SuccessNotification(
              this.translate.instant(value.message)
            );

            // Apply theme
            this.applyTheme(this.form.value.appearanceMode);

            // Handle language change
            this.handleLanguageChange(this.form.value.language);
          } else {
            this.notificationService.ErrorNotification(value.code);
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.notificationService.ErrorNotification(
            this.translate.instant("Update_Notification_Error")
          );
          this.isLoading = false;
        },
        complete: () => (this.isLoading = false),
      });
  }

  private handleLanguageChange(language: string): void {
    const normalizedLang = language.toLowerCase();

    if (normalizedLang === "arabic" || normalizedLang === "ar") {
      this.languageService.toggleLanguage("ar");
    } else if (normalizedLang === "english" || normalizedLang === "en") {
      this.languageService.toggleLanguage("en");
    }
  }

  // Utility methods for template
  

  

  get currentLanguage(): string {
    return this.languageService.activeCurrentLanguage;
  }
}
