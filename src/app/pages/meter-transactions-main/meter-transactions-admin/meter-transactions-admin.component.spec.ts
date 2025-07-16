import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeterTransactionsAdminComponent } from './meter-transactions-admin.component';

describe('MeterTransactionsAdminComponent', () => {
  let component: MeterTransactionsAdminComponent;
  let fixture: ComponentFixture<MeterTransactionsAdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MeterTransactionsAdminComponent]
    });
    fixture = TestBed.createComponent(MeterTransactionsAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
