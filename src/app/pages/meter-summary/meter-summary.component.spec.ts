import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeterSummaryComponent } from './meter-summary.component';

describe('MeterSummaryComponent', () => {
  let component: MeterSummaryComponent;
  let fixture: ComponentFixture<MeterSummaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MeterSummaryComponent]
    });
    fixture = TestBed.createComponent(MeterSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
