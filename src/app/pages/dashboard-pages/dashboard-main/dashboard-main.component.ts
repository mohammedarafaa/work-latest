import { Component } from '@angular/core';
import { AuthenticationService } from '@service/auth/authentication.service';
import { AccountType } from '@model/auth/auth.model';

@Component({
  selector: 'app-dashboard-main',
  templateUrl: './dashboard-main.component.html',
  styleUrls: ['./dashboard-main.component.scss']
})
export class DashboardMainComponent {
  // Make AccountType enum accessible in template
  public AccountType = AccountType;

  constructor(
    public authService: AuthenticationService,
  ) {}

  ngOnInit(): void {
   
  }
}
