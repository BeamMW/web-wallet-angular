import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionsViewComponent } from './transactions-view.component';

describe('TransactionsViewComponent', () => {
  let component: TransactionsViewComponent;
  let fixture: ComponentFixture<TransactionsViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionsViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
