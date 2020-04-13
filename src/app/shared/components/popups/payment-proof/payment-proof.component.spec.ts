import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentProofComponent } from './payment-proof.component';

describe('PaymentProofComponent', () => {
  let component: PaymentProofComponent;
  let fixture: ComponentFixture<PaymentProofComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentProofComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentProofComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
