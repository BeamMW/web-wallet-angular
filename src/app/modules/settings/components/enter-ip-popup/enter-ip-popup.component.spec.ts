import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EnterIpPopupComponent } from './enter-ip-popup.component';

describe('EnterIpPopupComponent', () => {
  let component: EnterIpPopupComponent;
  let fixture: ComponentFixture<EnterIpPopupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EnterIpPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnterIpPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
