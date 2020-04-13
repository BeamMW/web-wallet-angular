import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterIpPopupComponent } from './enter-ip-popup.component';

describe('EnterIpPopupComponent', () => {
  let component: EnterIpPopupComponent;
  let fixture: ComponentFixture<EnterIpPopupComponent>;

  beforeEach(async(() => {
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
