import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FtfGenerateSeedComponent } from './ftf-generate-seed.component';

describe('FtfGenerateSeedComponent', () => {
  let component: FtfGenerateSeedComponent;
  let fixture: ComponentFixture<FtfGenerateSeedComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FtfGenerateSeedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FtfGenerateSeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
