import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharingComponent } from './charing.component';

describe('CharingComponent', () => {
  let component: CharingComponent;
  let fixture: ComponentFixture<CharingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CharingComponent]
    });
    fixture = TestBed.createComponent(CharingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
