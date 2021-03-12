import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UtxoDetailsComponent } from './utxo-details.component';

describe('UtxoDetailsComponent', () => {
  let component: UtxoDetailsComponent;
  let fixture: ComponentFixture<UtxoDetailsComponent>;

  beforeEach(waitForAsync(() => {
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
