import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SendAddressesComponent } from './send-addresses.component';

describe('SendAddressesComponent', () => {
  let component: SendAddressesComponent;
  let fixture: ComponentFixture<SendAddressesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SendAddressesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendAddressesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
