import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HeaderPopupComponent } from './header-popup.component';

describe('HeaderPopupComponent', () => {
  let component: HeaderPopupComponent;
  let fixture: ComponentFixture<HeaderPopupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
