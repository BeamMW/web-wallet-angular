import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FtfConfirmSeedComponent } from './ftf-confirm-seed.component';

describe('FtfConfirmSeedComponent', () => {
  let component: FtfConfirmSeedComponent;
  let fixture: ComponentFixture<FtfConfirmSeedComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FtfConfirmSeedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FtfConfirmSeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
