import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {WalletUtxoComponent} from './components/wallet-utxo/wallet-utxo.component';
import {WalletAddressesComponent} from './components/wallet-addresses/wallet-addresses.component';
import {WalletTransactionsComponent} from './components/wallet-transactions/wallet-transactions.component';
import {WalletManagerComponent} from './components/wallet-manager/wallet-manager.component';
import {WalletComponent} from './components/wallet/wallet.component';
import {ReceiveComponent} from './components/receive/receive.component';
import {SendComponent} from './components/send/send.component';
import {SendSwapComponent} from './components/send-swap/send-swap.component';


const routes: Routes = [
  { path: '', component: WalletManagerComponent, pathMatch: 'full' },
  {
    path: 'wallet/:port',
    component: WalletComponent,
    children: [{
      path: 'transactions',
      component: WalletTransactionsComponent,
    }, {
      path: 'addresses',
      component: WalletAddressesComponent
    }, {
      path: 'utxo',
      component: WalletUtxoComponent
    }, {
      path: 'send',
      component: SendComponent
    }, {
      path: 'swap',
      component: SendSwapComponent
    }, {
      path: 'receive',
      component: ReceiveComponent
    }
] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
