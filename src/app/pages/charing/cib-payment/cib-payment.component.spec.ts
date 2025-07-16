import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CibPaymentComponent } from './cib-payment.component';

describe('CibPaymentComponent', () => {
  let component: CibPaymentComponent;
  let fixture: ComponentFixture<CibPaymentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CibPaymentComponent]
    });
    fixture = TestBed.createComponent(CibPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
