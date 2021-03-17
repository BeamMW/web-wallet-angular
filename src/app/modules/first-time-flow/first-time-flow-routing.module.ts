import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {
  FtfCreateComponent,
  FtfGenerateSeedComponent,
  FtfConfirmSeedComponent,
  FtfCreatePasswordComponent,
  FtfViewSeedComponent,
  FtfLoaderComponent,
  FtfRestoreComponent
} from './containers';

import {
  ReturnToSeedPopupComponent,
  SaveSeedPopupComponent
} from './components';

import { MainLayoutComponent } from '@shared/layouts';
import {
  HeaderWithoutLogoComponent,
  HeaderWithLinkComponent
} from '@shared/containers';

const routes: Routes = [{
  path: '',
  component: MainLayoutComponent,
  children: [
  {
    path: 'create',
    children: [{
        path: '', component: HeaderWithoutLogoComponent, outlet: 'header'
      }, {
        path: '', component: FtfCreateComponent
      }
    ]
  }, {
    path: 'loader',
    children: [{
        path: '', component: HeaderWithoutLogoComponent, outlet: 'header'
      }, {
        path: '', component: FtfLoaderComponent
      }
    ]
  }, {
    path: 'generate-seed',
    children: [{
        path: '', component: HeaderWithLinkComponent, outlet: 'header'
      }, {
        path: '', component: FtfGenerateSeedComponent
      }
    ]
  }, {
    path: 'confirm-seed',
    children: [{
        path: '', component: HeaderWithLinkComponent, outlet: 'header'
      }, {
        path: '', component: FtfConfirmSeedComponent
      }, {
        path: 'return-to-seed', component: ReturnToSeedPopupComponent, outlet: 'popup',
      }
    ]
  }, {
    path: 'create-password',
    children: [{
        path: '', component: HeaderWithLinkComponent, outlet: 'header'
      }, {
        path: '', component: FtfCreatePasswordComponent
      }, {
        path: 'return-to-seed', component: ReturnToSeedPopupComponent, outlet: 'popup',
      }
    ]
  }, {
    path: 'view-seed',
    children: [{
        path: '', component: HeaderWithLinkComponent, outlet: 'header'
      }, {
        path: '', component: FtfViewSeedComponent
      }, {
        path: 'save-seed', component: SaveSeedPopupComponent, outlet: 'popup',
      }
    ]
  }, {
    path: 'restore',
    children: [{
        path: '', component: HeaderWithLinkComponent, outlet: 'header'
      }, {
        path: '', component: FtfRestoreComponent
      }
    ]
  }]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})

export class FirstTimeFlowRoutingModule {
  constructor() {

  }
}
