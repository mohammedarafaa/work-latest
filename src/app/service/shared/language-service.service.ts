// language-service.service.ts (Fixed version)
import { environment } from "src/environments/environment";
import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { BehaviorSubject } from "rxjs";

export enum Language {
  arabic = "ar",
  english = "en",
}

@Injectable({
  providedIn: "root",
})
export class LanguageServiceService {
  currentLang: string = Language.english;

  // Add observables for reactive updates
  private languageChanged = new BehaviorSubject<string>(Language.english);
  private directionChanged = new BehaviorSubject<string>("ltr");

  constructor(public translate: TranslateService) {
    translate.addLangs([Language.english, Language.arabic]);

    // Initialize language from localStorage
    this.initializeLanguage();

    // Set default language
    translate.setDefaultLang(this.currentLang);

    // Apply initial direction
    this.applyDirection();
  }

  private initializeLanguage(): void {
    const storedLang = localStorage.getItem(environment.CurrentLang);

    if (storedLang) {
      try {
        this.currentLang = JSON.parse(storedLang);
      } catch (e) {
        // Fallback if parsing fails
        this.currentLang = storedLang;
      }
    } else {
      this.currentLang = Language.english;
      localStorage.setItem(
        environment.CurrentLang,
        JSON.stringify(Language.english)
      );
    }

    // Validate language value
    if (
      this.currentLang !== Language.arabic &&
      this.currentLang !== Language.english
    ) {
      this.currentLang = Language.english;
    }

    // Initialize observables with current values
    this.languageChanged.next(this.currentLang);
    this.directionChanged.next(this.getDirectionFromLanguage(this.currentLang));
  }

  public get activeCurrentLanguage(): string {
    return this.currentLang;
  }

  public toggleLanguage(lang: string): void {
    console.log("LanguageService: Toggling language to:", lang);

    // Validate language
    if (lang !== Language.arabic && lang !== Language.english) {
      console.warn("Invalid language code:", lang);
      return;
    }

    // Update translation service
    this.translate.use(lang).subscribe(() => {
      console.log("LanguageService: Translation updated");

      // Update current language
      this.currentLang = lang;

      // Save to localStorage
      localStorage.setItem(environment.CurrentLang, JSON.stringify(lang));

      // Apply direction changes immediately
      this.applyDirection();

      // Emit changes to subscribers
      this.languageChanged.next(lang);
      this.directionChanged.next(this.getDirectionFromLanguage(lang));

      // Dispatch custom events for components that need immediate updates
      this.dispatchCustomEvents(lang);
      window.location.reload(); // Reload to apply changes globally
    });
  }

  private applyDirection(): void {
    const direction = this.getDirectionFromLanguage(this.currentLang);

    if (typeof document !== "undefined") {
      // Apply to HTML and body elements
      document.documentElement.dir = direction;
      document.documentElement.lang = this.currentLang;
      document.body.dir = direction;
      document.body.lang = this.currentLang;

      // Add/remove CSS classes
      if (direction === "rtl") {
        document.documentElement.classList.add("rtl");
        document.documentElement.classList.remove("ltr");
        document.body.classList.add("rtl");
        document.body.classList.remove("ltr");
        document.documentElement.classList.add("lang-ar");
        document.documentElement.classList.remove("lang-en");
        document.body.classList.add("lang-ar");
        document.body.classList.remove("lang-en");
      } else {
        document.documentElement.classList.add("ltr");
        document.documentElement.classList.remove("rtl");
        document.body.classList.add("ltr");
        document.body.classList.remove("rtl");
        document.documentElement.classList.add("lang-en");
        document.documentElement.classList.remove("lang-ar");
        document.body.classList.add("lang-en");
        document.body.classList.remove("lang-ar");
      }

      // Force reflow to apply changes immediately
      document.documentElement.offsetHeight;

      console.log("Direction applied:", direction);
    }
  }

  private dispatchCustomEvents(lang: string): void {
    const direction = this.getDirectionFromLanguage(lang);

    // Dispatch multiple events for better compatibility
    const events = [
      new CustomEvent("languageChanged", {
        detail: { language: lang, direction, isRTL: direction === "rtl" },
      }),
      new CustomEvent("directionChanged", {
        detail: { direction, language: lang, isRTL: direction === "rtl" },
      }),
      new CustomEvent("appStateChanged", {
        detail: {
          language: lang,
          direction,
          isRTL: direction === "rtl",
          timestamp: Date.now(),
        },
      }),
    ];

    events.forEach((event) => {
      if (typeof document !== "undefined") {
        document.dispatchEvent(event);
      }
    });
  }

  private getDirectionFromLanguage(lang: string): "ltr" | "rtl" {
    return lang === Language.arabic ? "rtl" : "ltr";
  }

  // Observable getters for components to subscribe to
  public getLanguageChangedObservable() {
    return this.languageChanged.asObservable();
  }

  public getDirectionChangedObservable() {
    return this.directionChanged.asObservable();
  }

  // Utility methods
  public isRTL(): boolean {
    return this.currentLang === Language.arabic;
  }

  public getCurrentDirection(): string {
    return this.getDirectionFromLanguage(this.currentLang);
  }

  public getDisplayLanguage(langCode: string): string {
    switch (langCode) {
      case Language.arabic:
        return "Arabic";
      case Language.english:
        return "English";
      default:
        return "English";
    }
  }

  public getLanguageCode(displayName: string): string {
    switch (displayName.toLowerCase()) {
      case "arabic":
      case "العربية":
        return Language.arabic;
      case "english":
        return Language.english;
      default:
        return Language.english;
    }
  }

  private reverseLanguage(language: string): Language {
    return language === Language.english ? Language.arabic : Language.english;
  }
}
