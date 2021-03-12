import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddressesListComponent } from './addresses-list.component';

describe('AddressesListComponent', () => {
  let component: AddressesListComponent;
  let fixture: ComponentFixture<AddressesListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddressesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
