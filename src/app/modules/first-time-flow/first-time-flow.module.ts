import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FtfCreateComponent } from './pages/ftf-create/ftf-create.component';

import { FirstTimeFlowRoutingModule } from './first-time-flow-routing.module';


@NgModule({
  declarations: [
    FtfCreateComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    FirstTimeFlowRoutingModule
  ]
})
export class FirstTimeFlowModule { }
