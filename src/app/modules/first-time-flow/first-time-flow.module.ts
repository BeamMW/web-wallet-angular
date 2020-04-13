import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';

import {
  FtfCreateComponent,
  FtfGenerateSeedComponent,
  FtfConfirmSeedComponent,
  FtfCreatePasswordComponent,
  FtfViewSeedComponent} from './containers';

import { FirstTimeFlowRoutingModule } from './first-time-flow-routing.module';

@NgModule({
  declarations: [
    FtfCreateComponent,
    FtfGenerateSeedComponent,
    FtfViewSeedComponent,
    FtfConfirmSeedComponent,
    FtfCreatePasswordComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    FirstTimeFlowRoutingModule,
    SharedModule
  ]
})
export class FirstTimeFlowModule { }
