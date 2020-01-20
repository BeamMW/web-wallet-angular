import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';
import { AddressesRoutingModule } from './addresses-routing.module';
import { AddressesListComponent, AddressDetailsComponent } from './containers';
import { AddressElementComponent } from './components/address-element/address-element.component';

@NgModule({
  declarations: [
    AddressesListComponent,
    AddressElementComponent,
    AddressDetailsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    AddressesRoutingModule
  ]
})
export class AddressesModule { }