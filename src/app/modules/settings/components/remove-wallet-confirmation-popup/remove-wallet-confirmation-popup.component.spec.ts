import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoveWalletConfirmationPopupComponent } from './remove-wallet-confirmation-popup.component';

describe('RemoveWalletConfirmationPopupComponent', () => {
  let component: RemoveWalletConfirmationPopupComponent;
  let fixture: ComponentFixture<RemoveWalletConfirmationPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RemoveWalletConfirmationPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoveWalletConfirmationPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
