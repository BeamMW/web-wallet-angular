import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ReturnToSeedPopupComponent } from './return-to-seed-popup.component';

describe('ReturnToSeedPopupComponent', () => {
  let component: ReturnToSeedPopupComponent;
  let fixture: ComponentFixture<ReturnToSeedPopupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ReturnToSeedPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReturnToSeedPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
