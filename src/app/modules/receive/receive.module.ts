import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { ReceiveRoutingModule } from './receive-routing.module';
import { ReceiveComponent } from './containers/receive/receive.component';
import { QRCodeModule } from 'angularx-qrcode';

@NgModule({
  declarations: [
    ReceiveComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    ReceiveRoutingModule,
    QRCodeModule
  ]
})
export class ReceiveModule { }
