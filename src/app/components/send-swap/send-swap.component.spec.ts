import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SendSwapComponent } from './send-swap.component';

describe('SendSwapComponent', () => {
  let component: SendSwapComponent;
  let fixture: ComponentFixture<SendSwapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SendSwapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendSwapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
