import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {
  GeneralComponent,
  PrivacyComponent,
  ServerComponent,
  SettingsMainComponent,
  UtilitiesComponent
} from './containers';

import { MainLayoutComponent } from '@shared/layouts';
import { HeaderComponent } from '@shared/containers';
import { LoginGuard } from '../wallet/guards/login.guard';

import {
  MenuComponent,
  MenuFullComponent,
  PaymentProofComponent,
  SeedVerificationPopupComponent
} from '@shared/components';

import {
  RemoveWalletConfirmationPopupComponent,
  RemoveWalletPopupComponent,
  ClearWalletPopupComponent,
  EnterDnsPopupComponent,
  EnterIpPopupComponent,
  CheckPassConfirmationPopupComponent,
  ChangePasswordPopupComponent,
  ReportPopupComponent,
  ShowOwnerKeyPopupComponent
 } from './components';

const routes: Routes = [{
  path: '',
  component: MainLayoutComponent,
  canActivate: [LoginGuard],
  children: [
  {
    path: 'all',
    children: [{
        path: '', component: HeaderComponent, outlet: 'header'
      }, {
        path: 'menu', component: MenuComponent, outlet: 'sidemenu',
      }, {
        path: '', component: MenuFullComponent, outlet: 'sidemenu',
      }, {
        path: '', component: SettingsMainComponent
      }, {
        path: 'remove-wallet-popup', component: RemoveWalletPopupComponent, outlet: 'popup',
      }, {
        path: 'remove-wallet-confirmation-popup', component: RemoveWalletConfirmationPopupComponent, outlet: 'popup',
      }, {
        path: 'clear-wallet-popup', component: ClearWalletPopupComponent, outlet: 'popup',
      },
      // {
      //   path: 'enter-dns-popup', component: EnterDnsPopupComponent, outlet: 'popup',
      // }, {
      //   path: 'enter-ip-popup', component: EnterIpPopupComponent, outlet: 'popup',
      // },
      {
        path: 'check-pass-confirmation-popup', component: CheckPassConfirmationPopupComponent, outlet: 'popup',
      }, {
        path: 'change-pass-popup', component: ChangePasswordPopupComponent, outlet: 'popup',
      }, {
        path: 'seed-verification-popup', component: SeedVerificationPopupComponent, outlet: 'popup',
      }, {
        path: 'report-popup', component: ReportPopupComponent, outlet: 'popup',
      }, {
        path: 'payment-proof', component: PaymentProofComponent, outlet: 'popup',
      }, {
        path: 'show-owner-key', component: ShowOwnerKeyPopupComponent, outlet: 'popup',
      }
    ]
  }, {
    path: 'general',
    children: [{
        path: '', component: HeaderComponent, outlet: 'header'
      }, {
        path: '', component: GeneralComponent
      }, {
        path: 'payment-proof', component: PaymentProofComponent, outlet: 'popup',
      }, {
        path: 'clear-wallet-popup', component: ClearWalletPopupComponent, outlet: 'popup',
      }
    ]
  }, {
    path: 'server',
    children: [{
        path: '', component: HeaderComponent, outlet: 'header'
      }, {
        path: '', component: ServerComponent
      }, {
        path: 'payment-proof', component: PaymentProofComponent, outlet: 'popup',
      }
      // , {
      //   path: 'enter-dns-popup', component: EnterDnsPopupComponent, outlet: 'popup',
      // }, {
      //   path: 'enter-ip-popup', component: EnterIpPopupComponent, outlet: 'popup',
      // }
    ]
  }, {
    path: 'privacy',
    children: [{
        path: '', component: HeaderComponent, outlet: 'header'
      }, {
        path: '', component: PrivacyComponent
      }, {
        path: 'payment-proof', component: PaymentProofComponent, outlet: 'popup',
      }, {
        path: 'check-pass-confirmation-popup', component: CheckPassConfirmationPopupComponent, outlet: 'popup',
      }, {
        path: 'change-pass-popup', component: ChangePasswordPopupComponent, outlet: 'popup',
      }, {
        path: 'seed-verification-popup', component: SeedVerificationPopupComponent, outlet: 'popup',
      }, {
        path: 'show-owner-key', component: ShowOwnerKeyPopupComponent, outlet: 'popup',
      }
    ]
  }, {
    path: 'utilities',
    children: [{
        path: '', component: HeaderComponent, outlet: 'header'
      }, {
        path: '', component: UtilitiesComponent
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
export class SettingsRoutingModule {}
