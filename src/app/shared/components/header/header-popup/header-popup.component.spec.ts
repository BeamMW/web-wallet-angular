import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderPopupComponent } from './header-popup.component';

describe('HeaderPopupComponent', () => {
  let component: HeaderPopupComponent;
  let fixture: ComponentFixture<HeaderPopupComponent>;

  beforeEach(async(() => {
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
