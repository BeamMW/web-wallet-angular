import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FtfCreatePasswordComponent } from './ftf-create-password.component';

describe('FtfCreatePasswordComponent', () => {
  let component: FtfCreatePasswordComponent;
  let fixture: ComponentFixture<FtfCreatePasswordComponent>;

  beforeEach(async(() => {
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
