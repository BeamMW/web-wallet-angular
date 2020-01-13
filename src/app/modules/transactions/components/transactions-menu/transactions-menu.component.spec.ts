import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionsMenuComponent } from './transactions-menu.component';

describe('TransactionsMenuComponent', () => {
  let component: TransactionsMenuComponent;
  let fixture: ComponentFixture<TransactionsMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionsMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
