import { Component } from '@angular/core';
import { AuthToken } from '@model/auth/auth.model';
import { AuthenticationService } from '@service/auth/authentication.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent {
  currentUser!: AuthToken | null;
  now= new Date();
  constructor(
    private authService: AuthenticationService,
  ) {
    this.currentUser = this.authService.getAuthUser();

  }
  }