import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletStatusTitleComponent } from './wallet-status-title.component';

describe('WalletStatusTitleComponent', () => {
  let component: WalletStatusTitleComponent;
  let fixture: ComponentFixture<WalletStatusTitleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalletStatusTitleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletStatusTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
