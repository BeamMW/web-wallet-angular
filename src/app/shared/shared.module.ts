import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusTitleComponent } from './components';
import { MainLayoutComponent } from './layouts';
import { HeaderComponent } from './containers';
import { RouterModule } from '@angular/router';
import { HeaderLogoComponent, HeaderPopupComponent, ButtonComponent } from './components';

@NgModule({
  declarations: [
    StatusTitleComponent,
    MainLayoutComponent,
    HeaderComponent,
    HeaderLogoComponent,
    HeaderPopupComponent,
    ButtonComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    StatusTitleComponent,
    MainLayoutComponent,
    HeaderComponent,
    ButtonComponent
  ]
})
export class SharedModule { }
