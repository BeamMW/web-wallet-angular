import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FtfCreateComponent } from './ftf-create.component';

describe('FtfCreateComponent', () => {
  let component: FtfCreateComponent;
  let fixture: ComponentFixture<FtfCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FtfCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FtfCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
