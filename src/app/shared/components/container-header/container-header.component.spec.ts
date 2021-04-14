import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerHeaderComponent } from './container-header.component';

describe('ContainerHeaderComponent', () => {
  let component: ContainerHeaderComponent;
  let fixture: ComponentFixture<ContainerHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContainerHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContainerHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
