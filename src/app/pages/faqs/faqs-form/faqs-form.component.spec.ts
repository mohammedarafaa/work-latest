import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqsFormComponent } from './faqs-form.component';

describe('FaqsFormComponent', () => {
  let component: FaqsFormComponent;
  let fixture: ComponentFixture<FaqsFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FaqsFormComponent]
    });
    fixture = TestBed.createComponent(FaqsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
