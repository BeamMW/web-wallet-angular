import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClearWalletPopupComponent } from './clear-wallet-popup.component';

describe('ClearWalletPopupComponent', () => {
  let component: ClearWalletPopupComponent;
  let fixture: ComponentFixture<ClearWalletPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClearWalletPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClearWalletPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
