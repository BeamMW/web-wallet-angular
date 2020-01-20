import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { ReceiveRoutingModule } from './receive-routing.module';
import { ReceiveComponent } from './containers/receive/receive.component';
import { QRCodeModule } from 'angularx-qrcode';
import { EditAddressComponent } from './containers/edit-address/edit-address.component';
import { ChangeAddressComponent } from './containers/change-address/change-address.component';
import { QrPopupComponent } from './components/qr-popup/qr-popup.component';
import { ClipboardModule } from 'ngx-clipboard';

@NgModule({
  declarations: [
    ReceiveComponent,
    EditAddressComponent,
    ChangeAddressComponent,
    QrPopupComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    ReceiveRoutingModule,
    QRCodeModule,
    ClipboardModule
  ]
})
export class ReceiveModule { }
