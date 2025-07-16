import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PaymentService } from '@service/payment.service';
import { NotificationService } from '@service/shared/notifcation.service';
import { SharedService } from '@service/shared/Shared.service';

@Component({
  selector: 'app-charge',
  templateUrl: './charge.component.html',
  styleUrls: ['./charge.component.scss']
})
export class ChargeComponent {
  form: FormGroup = this.fb.group({});
  selectedCardIndex: number = 0;
  cards = [
    { type: 'Visa', last4: '1234', image: 'assets/img/payment/visa.png' },
    // { type: 'MasterCard', last4: '5678', image: 'assets/img/payment/master.png' },
    // { type: 'Meza', last4: '5678', image: 'assets/img/payment/MEZA.png' },
  ];
  isLoading: boolean = false;
  constructor(
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private paymentService:PaymentService,
    private http: HttpClient,
    private notificationService: NotificationService,
    private translate: TranslateService,
    private router: Router,
    private _sharedService: SharedService,
  ) {
    this.createForm();
  }
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }
  createForm() {
    this.form = this.fb.group({
      meterId: [1, [Validators.required]],
      amount: ['100', [Validators.required]],
      currency: ['EGP', [Validators.required]],
      paymentMethod: ['GATEWAY', [Validators.required]],
      paymentGatewayId: [1, [Validators.required]],
      useSavedCard: [false, [Validators.required]],
      subscriptionId: [1, [Validators.required]],
      saveNewCard: [true, [Validators.required]],
      returnUrl: [window.location.origin + '/payment-success', [Validators.required]],
      cancelUrl: [window.location.origin + '/payment-cancel', [Validators.required]],
    });
  }
  resetForm() {
    this.form.reset();
    this.router.navigate(['/Faqs']);
  }
   // Select a card
   selectCard(index: number) {
    this.selectedCardIndex = index;
  }
  charge() {
    this.paymentService.initPayment(this.form.value)
    .subscribe({
      next: (response) => {
        // Sanitize the payment URL from your payment processor
        // this.paymentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(response.paymentUrl);
        // this.isLoading = false;
        console.log(response);
        this.initializePaymentGetWay(response);
        // this.initializePaymentGetWay();
      },
      error: (error) => {
        console.error('Payment initialization failed:', error);
        // this.paymentError = true;
        this.isLoading = false;
      }
    }); 
  }
  paymentUrl: SafeResourceUrl | null = null;
  paymentComplete = false;
  paymentError = false;
  initializePaymentGetWay(paymentRes:any) {
    // Example: Create payment session with your backend
    const paymentData = {
      ...paymentRes.signedFields,
      // signature: "GKLG5JqLudAfgA6PF4ndo4FLlIrNtuZv9QueCXaU/Aw=",
      locale: "en",
      unsigned_field_names:"",
      submit:"Submit",
      // save_card:true
    };

console.log(paymentData);
const formData = new FormData();
// for (let key in paymentData) {
  Object.entries(paymentData).forEach((value: any) => {
  // console.log(`${key}: ${(user as any)[key]}`);
  formData.append(value[0],value[1]);
});
// formData.append()
    this.http.post<any>('https://testsecureacceptance.cybersource.com/pay', formData
      // , {
      //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      // }

    )
      .subscribe({
        next: (response:any) => {
          console.log(response);
          
          // Sanitize the payment URL from your payment processor
          this.paymentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(response.paymentUrl);
          this.isLoading = false;
        },
        error: (error:any) => {
          console.error('Payment initialization failed:', error);
          this.paymentError = true;
          this.isLoading = false;
        }
      });
  }
  retryPayment() {
    this.paymentError = false;
    this.paymentComplete = false;
    this.isLoading = true;
    this.charge();
  }
}
