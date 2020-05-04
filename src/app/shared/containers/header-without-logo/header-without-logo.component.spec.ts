import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderWithoutLogoComponent } from './header-without-logo.component';

describe('HeaderWithoutLogoComponent', () => {
  let component: HeaderWithoutLogoComponent;
  let fixture: ComponentFixture<HeaderWithoutLogoComponent>;

  beforeEach(async(() => {
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
