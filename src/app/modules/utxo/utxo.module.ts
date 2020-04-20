import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UtxoMainComponent } from './containers/utxo-main/utxo-main.component';
import { SharedModule } from '../../shared/shared.module';
import { UtxoRoutingModule } from './utxo-routing.module';
import { StatusSelectorComponent } from './components/status-selector/status-selector.component';
import { UtxoDetailsComponent } from './containers/utxo-details/utxo-details.component';

@NgModule({
  declarations: [
    UtxoMainComponent,
    StatusSelectorComponent,
    UtxoDetailsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    UtxoRoutingModule
  ]
})
export class UtxoModule { }
