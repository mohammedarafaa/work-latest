import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargeLimitFormComponent } from './charge-limit-form.component';

describe('ChargeLimitFormComponent', () => {
  let component: ChargeLimitFormComponent;
  let fixture: ComponentFixture<ChargeLimitFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChargeLimitFormComponent]
    });
    fixture = TestBed.createComponent(ChargeLimitFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
