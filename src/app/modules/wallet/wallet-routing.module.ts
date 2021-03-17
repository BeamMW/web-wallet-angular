import { NgModule } from '@angular/core';
import { Routes, RouterModule, Router } from '@angular/router';

import { RestorePopupComponent } from './components';
import { 
  MainComponent, 
  LoginComponent
} from './containers';
import { MenuComponent, MenuFullComponent } from '@shared/components';
import { MainLayoutComponent } from '@shared/layouts';
import { HeaderComponent, HeaderWithoutLogoComponent } from '@shared/containers';
import { LoginGuard } from './guards/login.guard';
import { InitializeGuard } from './guards/initialize.guard';
import {
  PaymentProofComponent,
  AddContactComponent,
  PaymentProofExportedComponent,
  SeedVerificationPopupComponent
} from '@shared/components';

const routes: Routes = [{
  path: '',
  canActivate: [LoginGuard],
  component: MainLayoutComponent,
  children: [{
    path: 'main',
    children: [{
        path: '', component: HeaderComponent, outlet: 'header'
      }, {
        path: 'menu', component: MenuComponent, outlet: 'sidemenu',
      },  {
        path: '', component: MenuFullComponent, outlet: 'sidemenu',
      }, {
        path: '', component: MainComponent
      }, {
        path: 'payment-proof', component: PaymentProofComponent, outlet: 'popup',
      }, {
        path: 'payment-proof-exported', component: PaymentProofExportedComponent, outlet: 'popup',
      }, {
        path: 'add-contact/:address', component: AddContactComponent, outlet: 'popup',
      }, {
        path: 'seed-verification-popup', component: SeedVerificationPopupComponent, outlet: 'popup',
      }
    ]
  }]
}, {
  path: '',
  canActivate: [InitializeGuard],
  component: MainLayoutComponent,
  children: [
  {
    path: 'login',
    children: [
      {
        path: '', component: HeaderWithoutLogoComponent, outlet: 'header'
      }, {
        path: '', component: LoginComponent
      }, {
        path: 'restore-popup', component: RestorePopupComponent, outlet: 'popup',
      }
    ]
  }]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class WalletRoutingModule {}
