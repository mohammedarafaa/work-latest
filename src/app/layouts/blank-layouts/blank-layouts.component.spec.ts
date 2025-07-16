import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlankLayoutsComponent } from './blank-layouts.component';

describe('BlankLayoutsComponent', () => {
  let component: BlankLayoutsComponent;
  let fixture: ComponentFixture<BlankLayoutsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BlankLayoutsComponent]
    });
    fixture = TestBed.createComponent(BlankLayoutsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
