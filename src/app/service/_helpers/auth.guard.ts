import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';

import { AuthenticationService } from '@service/auth/authentication.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private permission: string[] = [];
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,

  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    if (this.authenticationService.  isAuthenticated()) {

      return true;
    } else {
      this.router.navigate(['/Auth/Login'], {
        queryParams: { returnUrl: state.url },
      });
      return false;
    }
    // return true;
  }
  private hasIntersection(roles: string[]): boolean {
    return roles ? this.permission.some((perm) => roles.includes(perm)) : false;
  }


}
