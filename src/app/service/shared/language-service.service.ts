import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
export enum Language {
  arabic = 'ar',
  english = 'en',
}
@Injectable({
  providedIn: 'root',
})
export class LanguageServiceService {
  currentLang: string = '';
  constructor(public translate: TranslateService) {
    translate.addLangs([Language.english, Language.arabic]);

    const theme: any = localStorage.getItem(environment.CurrentLang);

    if (theme) {
      this.currentLang = JSON.parse(theme);
    } else {
      this.currentLang = Language.english;
      localStorage.setItem(
        environment.CurrentLang,
        JSON.stringify(Language.english)
      );
    }
    translate.setDefaultLang(this.currentLang);
  }
  public get activeCurrentLanguage(): string {
    return this.currentLang;
  }

  public toggleLanguage(lang: string): void {
    this.translate.use(lang);
    localStorage.setItem(environment.CurrentLang, JSON.stringify(lang));
  }

  private reverseLanguage(language: string): Language {
    return language === Language.english ? Language.arabic : Language.english;
  }
}
