import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletManagerComponent } from './wallet-manager.component';

describe('WalletManagerComponent', () => {
  let component: WalletManagerComponent;
  let fixture: ComponentFixture<WalletManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalletManagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
