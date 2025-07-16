import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '@service/auth/authentication.service';

import { AlertService } from '@service/shared/alert.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.css']
})
export class ForgetPasswordComponent {
  forgetForm!: FormGroup;
  loading = false;
  submitted = false;
  isLoading: boolean = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private notificationService: AlertService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.forgetForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.required,Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
    });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.forgetForm.controls;
  }

  onSubmit() {


    // stop here if form is invalid
    if (this.forgetForm.invalid) {
      return;
    }

    this.loading = true;
    this.isLoading = true;
    this.authenticationService
      .forgetPassword(this.forgetForm.value)
      .subscribe({
        next: (value:any) => {
          if(value.code == 200)
            {
              this.submitted = true;
              // get return url from query parameters or default to home page
              const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
              //this.router.navigateByUrl(returnUrl);
            }else{
              this.error = 'User_not_Found';
              this.isLoading = false;
              this.submitted = false;
            }



        },
        error: (error) => {
          this.error = error;
          console.log(error);

          this.loading = false;
        }
      });
  }
}
