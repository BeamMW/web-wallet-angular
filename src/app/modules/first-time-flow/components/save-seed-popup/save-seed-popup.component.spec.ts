import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SaveSeedPopupComponent } from './save-seed-popup.component';

describe('SaveSeedPopupComponent', () => {
  let component: SaveSeedPopupComponent;
  let fixture: ComponentFixture<SaveSeedPopupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SaveSeedPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveSeedPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
