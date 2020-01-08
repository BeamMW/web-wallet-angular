import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuControlComponent } from './menu-control.component';

describe('MenuControlComponent', () => {
  let component: MenuControlComponent;
  let fixture: ComponentFixture<MenuControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MenuControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
