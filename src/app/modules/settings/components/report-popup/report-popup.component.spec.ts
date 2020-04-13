import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportPopupComponent } from './report-popup.component';

describe('ReportPopupComponent', () => {
  let component: ReportPopupComponent;
  let fixture: ComponentFixture<ReportPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
