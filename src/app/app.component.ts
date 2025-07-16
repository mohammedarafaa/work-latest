import { DOCUMENT } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { LanguageServiceService } from '@service/shared/language-service.service';
import { MqttService } from '@service/shared/mqtt.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
    @Inject(DOCUMENT) private document: Document,
    public LanguageService: LanguageServiceService
  ) {

  }
  ngOnInit() {
    const htmlTag = this.document.getElementsByTagName('html')[0] as HTMLHtmlElement;
    const body = this.document.getElementsByTagName('body')[0] as HTMLBodyElement;
    htmlTag.dir = this.LanguageService.currentLang === 'ar' ? 'rtl' : 'ltr';
    htmlTag.lang = this.LanguageService.currentLang;
    body.dir = this.LanguageService.currentLang === 'ar' ? 'rtl' : 'ltr';
    body.lang = this.LanguageService.currentLang;
  }
}
