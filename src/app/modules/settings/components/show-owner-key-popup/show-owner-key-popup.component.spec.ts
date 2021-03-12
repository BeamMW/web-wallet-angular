import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ShowOwnerKeyPopupComponent } from './show-owner-key-popup.component';

describe('ShowOwnerKeyPopupComponent', () => {
  let component: ShowOwnerKeyPopupComponent;
  let fixture: ComponentFixture<ShowOwnerKeyPopupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowOwnerKeyPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowOwnerKeyPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
