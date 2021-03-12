import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FtfLoaderComponent } from './ftf-loader.component';

describe('FtfLoaderComponent', () => {
  let component: FtfLoaderComponent;
  let fixture: ComponentFixture<FtfLoaderComponent>;

  beforeEach(waitForAsync(() => {
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
