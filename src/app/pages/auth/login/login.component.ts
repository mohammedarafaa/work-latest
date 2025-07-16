import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '@service/auth/authentication.service';

import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { LoaderService } from '@service/shared/loader.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  isLoading: boolean = false;
  loginError = '';
  iconName: BehaviorSubject<any> = new BehaviorSubject('fas fa-eye-slash');
  passwordVisible = false;
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    public loaderService: LoaderService,
    private translate: TranslateService,
    private authenticationService: AuthenticationService
  ) {
    // redirect to home if already logged in

    if (!this.authenticationService.isTokenExpired()) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    /// this.loaderService.setSpinner(false);
    this.loginForm = this.formBuilder.group({
      userName: [null, Validators.required],
      password: [null, Validators.required]
    });
  }
  viewPassword() {
    this.passwordVisible = !this.passwordVisible;
    const icon = this.passwordVisible ? 'eye' : 'eye-slash';
    this.iconName.next(icon);
  }
  // convenience getter for easy access to form fields
  get f(): { [key: string]: AbstractControl } {
    return this.loginForm.controls;
  }
  Login() {
    this.isLoading = true;
    this.authenticationService
      .login(this.loginForm.value)
      .subscribe({
        next: (value) => {
          // get return url from query parameters or default to home page
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/Dashboard';
          console.log(returnUrl);

          this.router.navigateByUrl(returnUrl);
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.loginError = this.translate.instant('login_invalid_message');
        }
      });
  }
}
