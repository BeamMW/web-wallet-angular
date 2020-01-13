import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FtfGenerateSeedComponent } from './ftf-generate-seed.component';

describe('FtfGenerateSeedComponent', () => {
  let component: FtfGenerateSeedComponent;
  let fixture: ComponentFixture<FtfGenerateSeedComponent>;

  beforeEach(async(() => {
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
