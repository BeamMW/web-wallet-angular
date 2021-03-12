import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HeaderWithoutLogoComponent } from './header-without-logo.component';

describe('HeaderWithoutLogoComponent', () => {
  let component: HeaderWithoutLogoComponent;
  let fixture: ComponentFixture<HeaderWithoutLogoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderWithoutLogoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderWithoutLogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
