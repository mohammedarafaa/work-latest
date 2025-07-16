import { Component } from '@angular/core';
import { AccountType } from '@model/auth/auth.model';
import { AuthenticationService } from '@service/auth/authentication.service';

@Component({
  selector: 'app-meter-transactions-main',
  templateUrl: './meter-transactions-main.component.html',
  styleUrls: ['./meter-transactions-main.component.scss']
})
export class MeterTransactionsMainComponent {
  public AccountType = AccountType;

  constructor(
    public authService: AuthenticationService,
  ) {}
}
