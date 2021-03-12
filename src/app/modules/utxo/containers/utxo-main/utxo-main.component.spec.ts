import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UtxoMainComponent } from './utxo-main.component';

describe('UtxoMainComponent', () => {
  let component: UtxoMainComponent;
  let fixture: ComponentFixture<UtxoMainComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UtxoMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtxoMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
