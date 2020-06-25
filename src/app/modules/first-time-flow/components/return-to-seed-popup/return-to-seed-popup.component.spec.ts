import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnToSeedPopupComponent } from './return-to-seed-popup.component';

describe('ReturnToSeedPopupComponent', () => {
  let component: ReturnToSeedPopupComponent;
  let fixture: ComponentFixture<ReturnToSeedPopupComponent>;

  beforeEach(async(() => {
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
