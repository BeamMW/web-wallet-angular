import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'wallet/login', pathMatch: 'full'},
  {
    path: 'initialize',
    loadChildren: () => import('./modules/first-time-flow/first-time-flow.module').then(m => m.FirstTimeFlowModule)
  },{
    path: 'wallet',
    loadChildren: () => import('./modules/wallet/wallet.module').then(m => m.WalletModule)
  }, {
    path: 'send',
    loadChildren: () => import('./modules/send/send.module').then(m => m.SendModule)
  }, {
    path: 'transactions',
    loadChildren: () => import('./modules/transactions/transactions.module').then(m => m.TransactionsModule)
  }, {
    path: 'receive',
    loadChildren: () => import('./modules/receive/receive.module').then(m => m.ReceiveModule)
  }, {
    path: 'utxo',
    loadChildren: () => import('./modules/utxo/utxo.module').then(m => m.UtxoModule)
  }, {
    path: 'settings',
    loadChildren: () => import('./modules/settings/settings.module').then(m => m.SettingsModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    onSameUrlNavigation: 'reload',
    initialNavigation: 'enabled',
    paramsInheritanceStrategy: 'always',
    useHash: true,
    relativeLinkResolution: 'legacy'
})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
