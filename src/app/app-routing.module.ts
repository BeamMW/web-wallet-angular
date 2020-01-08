import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'wallet/login', pathMatch: 'full'},
  { path: 'initialize', loadChildren: './modules/first-time-flow/first-time-flow.module#FirstTimeFlowModule' },
  {
    path: 'wallet',
    loadChildren: () => import('./modules/wallet/wallet.module').then(m => m.WalletModule)
  }, {
    path: 'send',
    loadChildren: () => import('./modules/send/send.module').then(m => m.SendModule)
  }, {
    path: 'addresses',
    loadChildren: () => import('./modules/addresses/addresses.module').then(m => m.AddressesModule)
  }, {
    path: 'transactions',
    loadChildren: () => import('./modules/transactions/transactions.module').then(m => m.TransactionsModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
      onSameUrlNavigation: 'reload',
      initialNavigation: 'enabled',
      paramsInheritanceStrategy: 'always',
      useHash: true
    })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
