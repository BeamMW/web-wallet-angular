import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UtxoMainComponent } from './containers';
import {
  MenuComponent,
  MenuFullComponent,
  PaymentProofComponent
} from '@shared/components';
import { MainLayoutComponent } from '@shared/layouts';
import { HeaderComponent } from '@shared/containers';
import { LoginGuard } from '../wallet/guards/login.guard';

const routes: Routes = [{
  path: '',
  component: MainLayoutComponent,
  children: [
  {
    path: 'info',
    canActivate: [LoginGuard],
    children: [{
        path: '', component: HeaderComponent, outlet: 'header'
      }, {
        path: 'menu', component: MenuComponent, outlet: 'sidemenu',
      }, {
        path: '', component: MenuFullComponent, outlet: 'sidemenu',
      }, {
        path: '', component: UtxoMainComponent
      }, {
        path: 'payment-proof', component: PaymentProofComponent, outlet: 'popup',
      }
    ]
  }]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class UtxoRoutingModule {}
