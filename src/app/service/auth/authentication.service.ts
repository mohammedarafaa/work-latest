// auth/authentication.service.ts
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable } from "rxjs";
import { map, tap } from "rxjs/operators";

import { environment } from "@environments/environment";
import {
  LoginCredentials,
  ApiResponse,
  AuthToken,
  AccountType,
} from "@model/auth/auth.model";
import { ThemeService } from "@service/theme.service";
import { ProfileService } from "../profile.service";

@Injectable({ providedIn: "root" })
export class AuthenticationService {
  constructor(
    private router: Router,
    private profileService: ProfileService,
    private http: HttpClient,
    private themeService: ThemeService
  ) {}

  login(credentials: LoginCredentials): Observable<AuthToken> {
    return this.http
      .post<AuthToken>(
        `${environment.apiUrl}/Authentication/login`,
        credentials
      )
      .pipe(
        tap((response: AuthToken) => {
          if (response) {
            this.storeAuthTokens(response);

            // Load theme preferences after successful login
            if (this.getAccountType() === AccountType.CUSTOMER)
            {
              this.loadUserThemePreferences();
            }
    

            setTimeout(() => {
              const loginEvent = new CustomEvent("userLoggedIn", {
                detail: { user: response.username, timestamp: Date.now() },
              });
              document.dispatchEvent(loginEvent);
            }, 100);
          }
        })
      );
  }

  forgetPassword(
    credentials: LoginCredentials
  ): Observable<ApiResponse<AuthToken>> {
    return this.http
      .post<ApiResponse<AuthToken>>(
        `${environment.apiUrl}/Authentication/forgetPassword`,
        credentials
      )
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            this.storeAuthTokens(response.data);
            // Load theme preferences after password reset login
            this.loadUserThemePreferences();
          }
        })
      );
  }

  refreshToken(): Observable<ApiResponse<AuthToken>> {
    const refreshToken = this.getRefreshToken();
    return this.http
      .post<ApiResponse<AuthToken>>(
        `${environment.apiUrl}/Authentication/refreshToken`,
        { refreshToken }
      )
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            this.storeAuthTokens(response.data);
            // Don't reload theme on refresh token as user is still logged in
          }
        })
      );
  }

  logout(): void {
    console.log("AuthService: User logging out, clearing theme and tokens");

    // Clear theme to light mode before clearing tokens
    this.clearUserTheme();

    // Clear authentication tokens
    this.clearAuthTokens();

    // Navigate to home/login page
    this.router.navigateByUrl("/");
  }

  private loadUserThemePreferences(): void {
    console.log("AuthService: Loading user theme preferences after login");

    // Small delay to ensure tokens are properly stored
    setTimeout(() => {
      this.profileService.getNotificationPreferences().subscribe({
        next: (value) => {
          console.log("AuthService: Theme preferences loaded:", value);

          if (value.data && value.data.appearanceMode) {
            const isDarkTheme = value.data.appearanceMode === "DARK";
            console.log(
              "AuthService: Setting theme from API - Dark:",
              isDarkTheme
            );

            // Apply theme without saving back to API
            this.themeService.setDarkMode(isDarkTheme, false);
          } else {
            console.log(
              "AuthService: No theme preference found, using light theme"
            );
            this.themeService.setDarkMode(false, false);
          }
        },
        error: (err) => {
          console.error("AuthService: Error loading theme preferences:", err);
          // Fallback to light theme on error
          this.themeService.setDarkMode(false, false);
        },
      });
    }, 200);
  }

  private clearUserTheme(): void {
    console.log("AuthService: Clearing user theme on logout");

    // Reset to light theme
    this.themeService.setDarkMode(false, false);

    // Clear theme from localStorage
    localStorage.removeItem("theme");

    // Remove theme classes from document immediately
    this.removeThemeClasses();
  }

  private removeThemeClasses(): void {
    // Remove dark theme classes from document
    document.body.classList.remove("dark-theme");
    document.documentElement.classList.remove("dark-theme");
    document.documentElement.removeAttribute("data-bs-theme");

    console.log("AuthService: Removed all theme classes from document");
  }

  private storeAuthTokens(tokens: AuthToken): void {
    localStorage.setItem("access_token", tokens.accessToken);
    localStorage.setItem("refresh_token", tokens.refreshToken);
    localStorage.setItem(environment.currentUser, JSON.stringify(tokens));
  }

  private clearAuthTokens(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem(environment.currentUser);
  }

  getAccessToken(): string | null {
    return localStorage.getItem("access_token");
  }

  getRefreshToken(): string | null {
    return localStorage.getItem("refresh_token");
  }

  getAuthUser(): AuthToken | null {
    const userStr = localStorage.getItem(environment.currentUser);
    return userStr ? JSON.parse(userStr) : null;
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
      const parts = token.split(".");
      if (parts.length !== 3) {
        return true;
      }

      const payload = JSON.parse(atob(parts[1]));
      const expirationTime = payload.exp * 1000;
      return Date.now() >= expirationTime;
    } catch (error) {
      console.error("Error checking token expiration:", error);
      return true;
    }
  }

  getAccountType(): AccountType {
    const user = this.getAuthUser();
    if (!user) {
      return AccountType.CUSTOMER;
    }
    return user.accountType;
  }


  isAuthAccount(accountType: AccountType): Boolean {
    const user = this.getAuthUser();
    if (!user) {
      return false;
    }
    return user.accountType === accountType;
  }
}
