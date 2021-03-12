import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TransactionElementComponent } from './transaction-element.component';

describe('TransactionElementComponent', () => {
  let component: TransactionElementComponent;
  let fixture: ComponentFixture<TransactionElementComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionElementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
