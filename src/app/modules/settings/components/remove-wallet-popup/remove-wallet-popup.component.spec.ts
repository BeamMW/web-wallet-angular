import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RemoveWalletPopupComponent } from './remove-wallet-popup.component';

describe('RemoveWalletPopupComponent', () => {
  let component: RemoveWalletPopupComponent;
  let fixture: ComponentFixture<RemoveWalletPopupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RemoveWalletPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoveWalletPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
