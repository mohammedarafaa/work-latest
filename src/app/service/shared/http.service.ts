import { AuthenticationService } from '@service/auth/authentication.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ProfileService } from '@service/profile.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  token!: any;
  options = {};
  // headers;
  // LoggingUser:null
  constructor(
    private http: HttpClient,
    private profileService: ProfileService,
    private auth:AuthenticationService
  ) {
   
    if (this.auth.isTokenExpired()) {
      const headers = new Headers({
        'Content-Type': 'application/json',
        Accept: '*/*',
        Authorization: `Bearer ${this.auth.getAccessToken()}`,
      });
      this.options = {
        headers: headers,
      };
    }
  }

  _postCall<T>(
    source: string,
    body: any,
    contentTypeJson: boolean = true
  ): Observable<T> {
   
    const headers = new Headers({
      'Content-Type': 'application/json',
      Accept: '*/*',
      Authorization: `Bearer ${this.auth.getAccessToken()}`,
    });

    this.options = {
      headers: headers,
    };
    return this.http
      .post(source, body, this.options)
      .pipe(tap((res: any) => res));
  }
  _postCall_2<T>(
    source: string,
    body: any,
    contentTypeJson: boolean = false
  ): Observable<T> {
   

    const headers = new Headers({
      'Content-Type': 'multipart/form-data',
      Accept: '*/*',
      Authorization: `Bearer ${this.auth.getAccessToken()}`
    });

    this.options = {
      headers: headers
    };
    return this.http
      .post(source, body, this.options)
      .pipe(tap((res: any) => res));
  }
  _patchCall<T>(
    source: string,
    body: any,
    contentTypeJson: boolean = true
  ): Observable<T> {
   
    const headers = new Headers({
      'Content-Type': 'application/json',
      Accept: '*/*',
      Authorization: `Bearer ${this.auth.getAccessToken()}`,
    });

    this.options = {
      headers: headers,
    };
    return this.http
      .patch(source, body, this.options)
      .pipe(tap((res: any) => res));
  }
  _putCall<T>(
    source: string,
    body: any,
    contentTypeJson: boolean = true
  ): Observable<T> {
    return this.http
      .put(source, body, this.options)
      .pipe(tap((res: any) => res));
  }

  _getCall<T>(source: string, options?: any): Observable<T> {
    return this.http.get(source, { ...this.options, ...options }).pipe(tap((res: any) => res));
  }
  _deleteCall<T>(source: string): Observable<T> {
    // var options = {
    //   headers: this.headers
    // }
    return this.http.delete(source, this.options).pipe(tap((res: any) => res));
  }
  getData<T>(source: string): Observable<T> {
    return this.http.get(source).pipe(tap((res: any) => res));
  }


}
