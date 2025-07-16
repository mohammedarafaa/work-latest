import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeterTransactionsCustomerComponent } from './meter-transactions-customer.component';

describe('MeterTransactionsCustomerComponent', () => {
  let component: MeterTransactionsCustomerComponent;
  let fixture: ComponentFixture<MeterTransactionsCustomerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MeterTransactionsCustomerComponent]
    });
    fixture = TestBed.createComponent(MeterTransactionsCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
