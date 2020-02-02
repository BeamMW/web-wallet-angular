import { NgModule } from '@angular/core';
import { Routes, RouterModule, Router } from '@angular/router';

import { MainComponent, LoginComponent } from './containers';
import { MenuComponent, MenuFullComponent } from '@shared/components';
import { MainLayoutComponent } from '@shared/layouts';
import { HeaderComponent } from '@shared/containers';
import { LoginGuard } from './guards/login.guard';

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
        path: 'full-menu', component: MenuFullComponent, outlet: 'sidemenu',
      },{
        path: '', component: MainComponent
      }
    ]
  }]
}, {
  path: '',
  component: MainLayoutComponent,
  children: [
  {
    path: 'login',
    children: [
      {
        path: '', component: LoginComponent
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
