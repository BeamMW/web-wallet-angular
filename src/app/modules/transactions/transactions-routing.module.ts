import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransactionDetailsComponent, TransactionsViewComponent } from './containers';
import { MainLayoutComponent } from '@shared/layouts';
import { HeaderComponent } from '@shared/containers';

const routes: Routes = [{
  path: '',
  component: MainLayoutComponent,
  children: [
  {
    path: 'view',
    children: [{
        path: '', component: HeaderComponent, outlet: 'header'
      }, {
        path: '', component: TransactionsViewComponent
      }
    ]
  }]
}, {
  path: '',
  component: MainLayoutComponent,
  children: [
  {
    path: 'details',
    children: [{
        path: '', component: HeaderComponent, outlet: 'header'
      }, {
        path: '', component: TransactionDetailsComponent
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
