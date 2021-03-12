import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CheckPassConfirmationPopupComponent } from './check-pass-confirmation-popup.component';

describe('CheckPassConfirmationPopupComponent', () => {
  let component: CheckPassConfirmationPopupComponent;
  let fixture: ComponentFixture<CheckPassConfirmationPopupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckPassConfirmationPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckPassConfirmationPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
