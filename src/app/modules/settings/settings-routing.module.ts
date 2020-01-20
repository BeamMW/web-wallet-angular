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
import { MenuComponent } from '@shared/components';

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
        path: '', component: SettingsMainComponent
      }
    ]
  }, {
    path: 'general',
    children: [{
        path: '', component: HeaderComponent, outlet: 'header'
      }, {
        path: '', component: GeneralComponent
      }
    ]
  }, {
    path: 'server',
    children: [{
        path: '', component: HeaderComponent, outlet: 'header'
      }, {
        path: '', component: ServerComponent
      }
    ]
  }, {
    path: 'privacy',
    children: [{
        path: '', component: HeaderComponent, outlet: 'header'
      }, {
        path: '', component: PrivacyComponent
      }
    ]
  }, {
    path: 'utilities',
    children: [{
        path: '', component: HeaderComponent, outlet: 'header'
      }, {
        path: '', component: UtilitiesComponent
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
