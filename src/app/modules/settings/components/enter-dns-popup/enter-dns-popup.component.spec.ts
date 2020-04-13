import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterDnsPopupComponent } from './enter-dns-popup.component';

describe('EnterDnsPopupComponent', () => {
  let component: EnterDnsPopupComponent;
  let fixture: ComponentFixture<EnterDnsPopupComponent>;

  beforeEach(async(() => {
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
