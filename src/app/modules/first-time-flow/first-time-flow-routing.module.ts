import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {
  FtfCreateComponent,
  FtfGenerateSeedComponent,
  FtfConfirmSeedComponent,
  FtfCreatePasswordComponent,
  FtfViewSeedComponent} from './containers';

import { MainLayoutComponent } from '@shared/layouts';
import { HeaderComponent } from '@shared/containers';

const routes: Routes = [{
  path: '',
  component: MainLayoutComponent,
  children: [
  {
    path: 'create',
    children: [{
        path: '', component: FtfCreateComponent
      }
    ]
  }, {
    path: 'generate-seed',
    children: [{
        path: '', component: FtfGenerateSeedComponent
      }
    ]
  }, {
    path: 'confirm-seed',
    children: [{
        path: '', component: FtfConfirmSeedComponent
      }
    ]
  }, {
    path: 'create-password',
    children: [{
        path: '', component: FtfCreatePasswordComponent
      }
    ]
  }, {
    path: 'view-seed',
    children: [{
        path: '', component: FtfViewSeedComponent
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
