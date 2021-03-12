import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StatusSelectorComponent } from './status-selector.component';

describe('StatusSelectorComponent', () => {
  let component: StatusSelectorComponent;
  let fixture: ComponentFixture<StatusSelectorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StatusSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
