import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';
import { SendRoutingModule } from './send-routing.module';
import { SendConfirmationComponent } from './containers/send-confirmation/send-confirmation.component';

@NgModule({
  declarations: [SendConfirmationComponent],
  imports: [
    CommonModule,
    SharedModule,
    SendRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class SendModule { }
