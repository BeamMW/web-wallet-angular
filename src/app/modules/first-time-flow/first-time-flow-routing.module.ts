import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FtfCreateComponent } from './pages/ftf-create/ftf-create.component';

const routes: Routes = [{
  path: 'initialize',
  component: FtfCreateComponent,
  children: [{
    path: 'create',
    component: FtfCreateComponent,
    pathMatch: 'full',
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
