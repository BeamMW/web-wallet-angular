import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EnterDnsPopupComponent } from './enter-dns-popup.component';

describe('EnterDnsPopupComponent', () => {
  let component: EnterDnsPopupComponent;
  let fixture: ComponentFixture<EnterDnsPopupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EnterDnsPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnterDnsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
