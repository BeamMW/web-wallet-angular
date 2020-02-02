import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuFullComponent } from './menu-full.component';

describe('MenuFullComponent', () => {
  let component: MenuFullComponent;
  let fixture: ComponentFixture<MenuFullComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MenuFullComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuFullComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
