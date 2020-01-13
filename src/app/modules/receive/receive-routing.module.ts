import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainLayoutComponent } from '@shared/layouts';
import { HeaderComponent } from '@shared/containers';
import { LoginGuard } from './../wallet/guards/login.guard';
import { ReceiveComponent } from './containers/receive/receive.component';

const routes: Routes = [{
  path: '',
  component: MainLayoutComponent,
  canActivate: [LoginGuard],
  children: [
  {
    path: 'main',
    children: [{
        path: '', component: HeaderComponent, outlet: 'header'
      }, {
        path: '', component: ReceiveComponent
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