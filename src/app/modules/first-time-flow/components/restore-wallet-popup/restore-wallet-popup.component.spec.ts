import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RestoreWalletPopupComponent } from './restore-wallet-popup.component';

describe('RestoreWalletPopupComponent', () => {
  let component: RestoreWalletPopupComponent;
  let fixture: ComponentFixture<RestoreWalletPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RestoreWalletPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestoreWalletPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
