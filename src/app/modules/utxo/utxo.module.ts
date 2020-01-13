import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UtxoMainComponent } from './containers/utxo-main/utxo-main.component';
import { SharedModule } from '../../shared/shared.module';
import { UtxoRoutingModule } from './utxo-routing.module';

@NgModule({
  declarations: [
    UtxoMainComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    UtxoRoutingModule
  ]
})
export class UtxoModule { }
