import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {
  TransactionDetailsComponent,
  TransactionsViewComponent
} from './containers';
import { MainLayoutComponent } from '@shared/layouts';
import { HeaderComponent } from '@shared/containers';
import {
  PaymentProofExportedComponent,
  PaymentProofComponent
} from '@shared/components';
import { LoginGuard } from './../wallet/guards/login.guard';

const routes: Routes = [{
  path: '',
  component: MainLayoutComponent,
  canActivate: [LoginGuard],
  children: [
  {
    path: 'view',
    children: [{
        path: '', component: HeaderComponent, outlet: 'header'
      }, {
        path: '', component: TransactionsViewComponent
      }, {
        path: 'payment-proof', component: PaymentProofComponent, outlet: 'popup',
      }
    ]
  }]
}, {
  path: '',
  component: MainLayoutComponent,
  canActivate: [LoginGuard],
  children: [
  {
    path: 'details/:id',
    children: [{
        path: '', component: HeaderComponent, outlet: 'header'
      }, {
        path: '', component: TransactionDetailsComponent
      }, {
        path: 'payment-proof', component: PaymentProofComponent, outlet: 'popup',
      }, {
        path: 'payment-proof-exported', component: PaymentProofExportedComponent, outlet: 'popup',
      }
    ]
  }]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class TransactionsRoutingModule {}
