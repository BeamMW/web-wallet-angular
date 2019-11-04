import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusTitleComponent } from './components';

@NgModule({
  declarations: [
    StatusTitleComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    StatusTitleComponent
  ]
})
export class SharedModule { }
