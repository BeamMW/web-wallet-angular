import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeedVerificationPopupComponent } from './seed-verification-popup.component';

describe('SeedVerificationPopupComponent', () => {
  let component: SeedVerificationPopupComponent;
  let fixture: ComponentFixture<SeedVerificationPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeedVerificationPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeedVerificationPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
