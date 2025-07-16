import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthenticationService } from '@service/auth/authentication.service';
import { Router } from '@angular/router';
import { ERROR } from '@model/Utils/ERROR';
// import { NotificationService } from '../shared/notifcation.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  errorList: any[] = ERROR;
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    // private notificationService: NotificationService,
    // private translate: TranslateService
  ) { }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err) => {
        console.log(err);

        if (this.authenticationService.isTokenExpired()) {
          if ([401].includes(err.status) || [403].includes(err.status)) {
            this.authenticationService.logout();
          } else if ([0].includes(err.status)) {
            this.router.navigate(['/Error/502']);
          } else {
            // this.router.navigate(['/Error/500']);
            console.log(err.error.code);
          }
        }

        const error = err.error || err.statusText;
        return throwError(() => error);
      })
    );
  }
}
