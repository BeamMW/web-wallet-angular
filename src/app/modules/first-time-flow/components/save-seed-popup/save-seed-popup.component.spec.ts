import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveSeedPopupComponent } from './save-seed-popup.component';

describe('SaveSeedPopupComponent', () => {
  let component: SaveSeedPopupComponent;
  let fixture: ComponentFixture<SaveSeedPopupComponent>;

  beforeEach(async(() => {
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
