import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FtfRestoreComponent } from './ftf-restore.component';

describe('FtfRestoreComponent', () => {
  let component: FtfRestoreComponent;
  let fixture: ComponentFixture<FtfRestoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FtfRestoreComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FtfRestoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
