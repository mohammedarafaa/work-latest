import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargeByCustomerServiceComponent } from './charge-by-customer-service.component';

describe('ChargeByCustomerServiceComponent', () => {
  let component: ChargeByCustomerServiceComponent;
  let fixture: ComponentFixture<ChargeByCustomerServiceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChargeByCustomerServiceComponent]
    });
    fixture = TestBed.createComponent(ChargeByCustomerServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
