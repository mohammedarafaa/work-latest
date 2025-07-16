import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { LoginCredentials, ApiResponse, AuthToken, AccountType } from '@model/auth/auth.model';


@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  // private userSubject: BehaviorSubject<User | null>;

  constructor(private router: Router, private http: HttpClient) {

  }

  login(credentials: LoginCredentials): Observable<AuthToken> {
    return this.http.post<AuthToken>(`${environment.apiUrl}/Authentication/login`, credentials)
      .pipe(
        tap((response:AuthToken) => {
          if (response) {
            this.storeAuthTokens(response);
          }
        })
      );
  }
  forgetPassword(credentials: LoginCredentials): Observable<ApiResponse<AuthToken>> {
    return this.http.post<ApiResponse<AuthToken>>(`${environment.apiUrl}/Authentication/forgetPassword`, credentials)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.storeAuthTokens(response.data);
          }
        })
      );
  }

  refreshToken(): Observable<ApiResponse<AuthToken>> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<ApiResponse<AuthToken>>(`${environment.apiUrl}/Authentication/refreshToken`, { refreshToken })
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.storeAuthTokens(response.data);
          }
        })
      );
  }

  logout(): void {
    this.clearAuthTokens();
  }

  private storeAuthTokens(tokens: AuthToken): void {
    localStorage.setItem('access_token', tokens.accessToken);
    localStorage.setItem('refresh_token', tokens.refreshToken);
    localStorage.setItem(environment.currentUser, JSON.stringify(tokens));
  }

  private clearAuthTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem(environment.currentUser);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }
  getAuthUser(): AuthToken | null {
    return JSON.parse(localStorage.getItem(environment.currentUser)!);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken() && !this.isTokenExpired();
  }
  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) {
      return true;
    }

    try {
      // Split the token into parts
      const parts = token.split('.');
      if (parts.length !== 3) {
        return true;
      }

      // Decode the payload (second part)
      const payload = JSON.parse(atob(parts[1]));

      // Check if the token has expired
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expirationTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  getAccountType(): AccountType {
    const user = this.getAuthUser();
    if (!user) {
      return AccountType.CUSTOMER; // Default to CUSTOMER if no user is found
    }
    
    return user.accountType || AccountType.CUSTOMER;
    
  }
  isAuthAccount(accountType:AccountType): Boolean {
    const user = this.getAuthUser();
    if (!user) {
      return false; // Default to CUSTOMER if no user is found
    }
    
    return user.accountType === accountType;
    
  }
}
