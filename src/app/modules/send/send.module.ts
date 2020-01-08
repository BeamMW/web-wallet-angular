import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';
import { SendRoutingModule } from './send-routing.module';
import {
  SendConfirmationComponent,
  SendAddressesComponent,
  SendAmountComponent } from './containers';
import { TextareaAutosizeModule } from 'ngx-textarea-autosize';

@NgModule({
  declarations: [
    SendConfirmationComponent,
    SendAddressesComponent,
    SendAmountComponent
  ],
  imports: [
    TextareaAutosizeModule,
    CommonModule,
    SharedModule,
    SendRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class SendModule { }
