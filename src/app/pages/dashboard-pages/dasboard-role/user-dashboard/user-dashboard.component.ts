import { Component } from '@angular/core';
import { AuthToken } from '@model/auth/auth.model';
import { AuthenticationService } from '@service/auth/authentication.service';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent {
  currentUser!: AuthToken | null;
  now= new Date();
  constructor(
    private authService: AuthenticationService,
  ) {
    this.currentUser = this.authService.getAuthUser();

  }
}
