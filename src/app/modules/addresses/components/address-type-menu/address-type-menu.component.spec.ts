import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressTypeMenuComponent } from './address-type-menu.component';

describe('AddressTypeMenuComponent', () => {
  let component: AddressTypeMenuComponent;
  let fixture: ComponentFixture<AddressTypeMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddressTypeMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressTypeMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
