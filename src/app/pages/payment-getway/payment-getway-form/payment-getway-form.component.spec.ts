import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentGetwayFormComponent } from './payment-getway-form.component';

describe('PaymentGetwayFormComponent', () => {
  let component: PaymentGetwayFormComponent;
  let fixture: ComponentFixture<PaymentGetwayFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PaymentGetwayFormComponent]
    });
    fixture = TestBed.createComponent(PaymentGetwayFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
