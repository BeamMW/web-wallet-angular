import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderWithLinkComponent } from './header-with-link.component';

describe('HeaderWithLinkComponent', () => {
  let component: HeaderWithLinkComponent;
  let fixture: ComponentFixture<HeaderWithLinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderWithLinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderWithLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
