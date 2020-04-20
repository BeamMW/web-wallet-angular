import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UtxoDetailsComponent } from './utxo-details.component';

describe('UtxoDetailsComponent', () => {
  let component: UtxoDetailsComponent;
  let fixture: ComponentFixture<UtxoDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UtxoDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtxoDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
