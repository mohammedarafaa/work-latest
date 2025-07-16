import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletedModalComponent } from './deleted-modal.component';

describe('DeletedModalComponent', () => {
  let component: DeletedModalComponent;
  let fixture: ComponentFixture<DeletedModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeletedModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeletedModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
