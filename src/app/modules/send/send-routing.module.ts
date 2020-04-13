import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {
  SendConfirmationComponent,
  SendAddressesComponent,
  SendAmountComponent } from './containers';
import { MainLayoutComponent } from '@shared/layouts';
import {
  MenuFullComponent,
  PaymentProofComponent
} from '@shared/components';
import { HeaderComponent } from '@shared/containers';
import { LoginGuard } from './../wallet/guards/login.guard';
import { ConfirmationPopupComponent } from './components/confirmation-popup/confirmation-popup.component';

const routes: Routes = [{
  path: '',
  component: MainLayoutComponent,
  canActivate: [LoginGuard],
  children: [
  {
    path: 'confirmation',
    children: [{
        path: '', component: HeaderComponent, outlet: 'header'
      }, {
        path: 'confirm-popup', component: ConfirmationPopupComponent, outlet: 'popup',
      }, {
        path: '', component: MenuFullComponent, outlet: 'sidemenu',
      },  {
        path: '', component: SendConfirmationComponent
      }, {
        path: 'payment-proof', component: PaymentProofComponent, outlet: 'popup',
      }
    ]
  }, {
    path: 'addresses',
    children: [{
        path: '', component: HeaderComponent, outlet: 'header'
      }, {
        path: 'confirm-popup', component: ConfirmationPopupComponent, outlet: 'popup',
      }, {
        path: '', component: MenuFullComponent, outlet: 'sidemenu',
      }, {
        path: '', component: SendAddressesComponent
      }, {
        path: 'payment-proof', component: PaymentProofComponent, outlet: 'popup',
      }
    ]
  }, {
    path: 'amount',
    children: [{
        path: '', component: HeaderComponent, outlet: 'header'
      }, {
        path: '', component: MenuFullComponent, outlet: 'sidemenu',
      }, {
        path: '', component: SendAmountComponent
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
export class SendRoutingModule {}
