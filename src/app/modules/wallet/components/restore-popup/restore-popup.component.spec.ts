import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestorePopupComponent } from './restore-popup.component';

describe('RestorePopupComponent', () => {
  let component: RestorePopupComponent;
  let fixture: ComponentFixture<RestorePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RestorePopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RestorePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
