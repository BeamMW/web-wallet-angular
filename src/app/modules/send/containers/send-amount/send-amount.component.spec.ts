import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SendAmountComponent } from './send-amount.component';

describe('SendAmountComponent', () => {
  let component: SendAmountComponent;
  let fixture: ComponentFixture<SendAmountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SendAmountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendAmountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
