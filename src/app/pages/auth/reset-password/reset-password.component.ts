import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '@service/auth/authentication.service';

import { BehaviorSubject } from 'rxjs';
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  form!: FormGroup;
  loading = false;
  submitted = false;
  isLoading: boolean = false;
  error = '';
  passwordVisible:boolean = false;
  repearPasswordVisible:boolean = false;
  iconName: BehaviorSubject<any> = new BehaviorSubject('fas fa-eye-slash');

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService
  ) {
    // redirect to home if already logged in
    if (!this.authenticationService.isTokenExpired()) {
      this.router.navigate(['/']);
    }
  }
  confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.form.get('newPassword')?.value) {
      return { confirm: true, error: true };
    }
    return {};
  };
  ngOnInit() {
    this.form =  this.formBuilder.group({
      newPassword: [null, [Validators.required]],
      repeat_new_password: [null, [Validators.required,this.confirmationValidator]],

    });
  }

  // convenience getter for easy access to form fields
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }
  viewPassword() {
    this.passwordVisible = !this.passwordVisible;
    const icon = this.passwordVisible ? 'eye' : 'eye-slash';
    this.iconName.next(icon);
  }
  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    this.authenticationService
      .login(this.form.value)
      .subscribe({
        next: () => {
          // get return url from query parameters or default to home page
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigateByUrl(returnUrl);
        },
        error: (error) => {
          this.error = error;
          this.loading = false;
        }
      });
  }
}
