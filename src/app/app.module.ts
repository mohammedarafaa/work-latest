import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import en from '@angular/common/locales/en';
import ar from '@angular/common/locales/ar';
import { registerLocaleData, LocationStrategy, HashLocationStrategy } from '@angular/common';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ErrorInterceptor } from '@service/_helpers/error.interceptor';
import { JwtInterceptor } from '@service/_helpers/jwt.interceptor';
import { LoadingInterceptor } from '@service/_helpers/loading.interceptor';
import { environment } from '@environments/environment';
import { IMqttServiceOptions, MqttModule } from 'ngx-mqtt';
import { MqttService } from '@service/shared/mqtt.service';
import { LanguageService } from '@service/language.service';

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

registerLocaleData(en);
registerLocaleData(ar);

export const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
  connectOnCreate: false,
  hostname: environment.Mqqt_host,
  port: 4200,
  protocol: 'ws',
  username: "",
  password: "",
  path: '',
};

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MqttModule.forRoot(MQTT_SERVICE_OPTIONS),
    NgbModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: Window, useValue: window },
    // MqttService,
    LanguageService
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
