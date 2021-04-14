import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsPopupComponent } from './details-popup.component';

describe('DetailsPopupComponent', () => {
  let component: DetailsPopupComponent;
  let fixture: ComponentFixture<DetailsPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailsPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
