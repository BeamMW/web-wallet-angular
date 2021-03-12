import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddressElementComponent } from './address-element.component';

describe('AddressElementComponent', () => {
  let component: AddressElementComponent;
  let fixture: ComponentFixture<AddressElementComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddressElementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
