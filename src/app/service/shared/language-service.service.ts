import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { DirectionService } from './direction.service';

export enum Language {
  arabic = 'ar',
  english = 'en',
}
@Injectable({
  providedIn: 'root',
})
export class LanguageServiceService {
  currentLang: string = '';
  private languageChanged = new Subject<string>();

  constructor(public translate: TranslateService, private directionService: DirectionService) {
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
    this.languageChanged.next(lang); // Emit the new language
    this.directionService.setDirection(lang === Language.arabic ? 'rtl' : 'ltr');
  }

  public getLanguageChangedObservable() {
    return this.languageChanged.asObservable();
  }

  private reverseLanguage(language: string): Language {
    return language === Language.english ? Language.arabic : Language.english;
  }
}
