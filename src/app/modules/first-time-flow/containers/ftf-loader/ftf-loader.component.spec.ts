import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FtfLoaderComponent } from './ftf-loader.component';

describe('FtfLoaderComponent', () => {
  let component: FtfLoaderComponent;
  let fixture: ComponentFixture<FtfLoaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FtfLoaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FtfLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
