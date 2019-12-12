import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SendConfirmationComponent } from './containers';
// import {  } from './components';
import { MainLayoutComponent } from '../../shared/layouts';
import { HeaderComponent } from '../../shared/containers';

const routes: Routes = [{
  path: '',
  component: MainLayoutComponent,
  children: [
  {
    path: 'confirmation',
    children: [{
        path: '', component: HeaderComponent, outlet: 'header'
      }, {
        path: '', component: SendConfirmationComponent
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
