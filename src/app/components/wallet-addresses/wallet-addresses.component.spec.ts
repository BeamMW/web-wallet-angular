import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletAddressesComponent } from './wallet-addresses.component';

describe('WalletAddressesComponent', () => {
  let component: WalletAddressesComponent;
  let fixture: ComponentFixture<WalletAddressesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalletAddressesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletAddressesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
