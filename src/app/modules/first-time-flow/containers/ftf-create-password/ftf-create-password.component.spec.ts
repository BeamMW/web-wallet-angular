import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FtfCreatePasswordComponent } from './ftf-create-password.component';

describe('FtfCreatePasswordComponent', () => {
  let component: FtfCreatePasswordComponent;
  let fixture: ComponentFixture<FtfCreatePasswordComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FtfCreatePasswordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FtfCreatePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
