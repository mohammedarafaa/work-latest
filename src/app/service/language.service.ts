import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  constructor(private translate: TranslateService) { }

  initLanguage() {
    this.translate.addLangs(['en', 'ar']);
    const browserLang = this.translate.getBrowserLang();
    let defaultLang = 'en';

    if (browserLang && browserLang.match(/en|ar/)) {
      defaultLang = browserLang;
    }

    const savedLang = localStorage.getItem('lang');
    if (savedLang) {
      defaultLang = savedLang;
    }

    this.translate.setDefaultLang(defaultLang);
    this.changeLanguage(defaultLang);
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }

  getCurrentLang() {
    return this.translate.currentLang;
  }
}
