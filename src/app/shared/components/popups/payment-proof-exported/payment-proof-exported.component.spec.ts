import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PaymentProofExportedComponent } from './payment-proof-exported.component';

describe('PaymentProofExportedComponent', () => {
  let component: PaymentProofExportedComponent;
  let fixture: ComponentFixture<PaymentProofExportedComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentProofExportedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentProofExportedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
