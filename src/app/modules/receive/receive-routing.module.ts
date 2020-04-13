import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainLayoutComponent } from '@shared/layouts';
import { HeaderComponent } from '@shared/containers';
import {
  MenuFullComponent,
  PaymentProofComponent
} from '@shared/components';
import { LoginGuard } from './../wallet/guards/login.guard';
import { ReceiveComponent } from './containers/receive/receive.component';
import { QrPopupComponent } from './components/qr-popup/qr-popup.component';

const routes: Routes = [{
  path: '',
  component: MainLayoutComponent,
  canActivate: [LoginGuard],
  children: [
  {
    path: 'page',
    children: [{
        path: '', component: HeaderComponent, outlet: 'header'
      }, {
        path: 'qr-popup', component: QrPopupComponent, outlet: 'popup',
      }, {
        path: '', component: MenuFullComponent, outlet: 'sidemenu',
      }, {
        path: '', component: ReceiveComponent
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
export class ReceiveRoutingModule {
  constructor() {

  }
}