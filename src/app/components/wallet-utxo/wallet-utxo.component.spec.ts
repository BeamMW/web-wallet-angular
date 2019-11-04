import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletUtxoComponent } from './wallet-utxo.component';

describe('WalletUtxoComponent', () => {
  let component: WalletUtxoComponent;
  let fixture: ComponentFixture<WalletUtxoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalletUtxoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletUtxoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
