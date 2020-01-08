import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddressesListComponent, AddressDetailsComponent } from './containers';
import { MenuComponent } from '@shared/components';
import { MainLayoutComponent } from '@shared/layouts';
import { HeaderComponent } from '@shared/containers';

const routes: Routes = [{
  path: '',
  component: MainLayoutComponent,
  children: [
  {
    path: 'list',
    children: [{
        path: '', component: HeaderComponent, outlet: 'header'
      }, {
        path: 'menu', component: MenuComponent, outlet: 'sidemenu',
      }, {
        path: '', component: AddressesListComponent
      }
    ]
  }, {
    path: 'details/:address',
    children: [{
        path: '', component: HeaderComponent, outlet: 'header'
      }, {
        path: 'menu', component: MenuComponent, outlet: 'sidemenu',
      }, {
        path: '', component: AddressDetailsComponent
      }
    ]
  }]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class AddressesRoutingModule {}
