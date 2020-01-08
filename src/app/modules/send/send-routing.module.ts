import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {
  SendConfirmationComponent,
  SendAddressesComponent,
  SendAmountComponent } from './containers';
import { MainLayoutComponent } from '@shared/layouts';
import { HeaderComponent } from '@shared/containers';

const routes: Routes = [{
  path: '',
  component: MainLayoutComponent,
  children: [
  {
    path: 'confirmation',
    children: [{
        path: '', component: HeaderComponent, outlet: 'header'
      }, {
        path: '', component: SendConfirmationComponent
      }
    ]
  }, {
    path: 'addresses',
    children: [{
        path: '', component: HeaderComponent, outlet: 'header'
      }, {
        path: '', component: SendAddressesComponent
      }
    ]
  }, {
    path: 'amount',
    children: [{
        path: '', component: HeaderComponent, outlet: 'header'
      }, {
        path: '', component: SendAmountComponent
      }
    ]
  }]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class SendRoutingModule {}
