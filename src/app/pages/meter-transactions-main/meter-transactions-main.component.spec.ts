import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeterTransactionsMainComponent } from './meter-transactions-main.component';

describe('MeterTransactionsMainComponent', () => {
  let component: MeterTransactionsMainComponent;
  let fixture: ComponentFixture<MeterTransactionsMainComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MeterTransactionsMainComponent]
    });
    fixture = TestBed.createComponent(MeterTransactionsMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
