import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { ReceiveRoutingModule } from './receive-routing.module';
import { ReceiveComponent } from './containers/receive/receive.component';

@NgModule({
  declarations: [
    ReceiveComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    ReceiveRoutingModule
  ]
})
export class ReceiveModule { }
