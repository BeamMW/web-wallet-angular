import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusTitleComponent } from './components';
import { MainLayoutComponent } from './layouts';
import { HeaderComponent } from './containers';
import { RouterModule } from '@angular/router';
import { HeaderLogoComponent, HeaderPopupComponent, ButtonComponent, MenuComponent } from './components';
import { MenuControlComponent } from './components/menu-control/menu-control.component';
import { ClickOutsideDirective } from './directives/click-outside/click-outside.directive';

@NgModule({
  declarations: [
    StatusTitleComponent,
    MainLayoutComponent,
    HeaderComponent,
    HeaderLogoComponent,
    HeaderPopupComponent,
    ButtonComponent,
    MenuComponent,
    MenuControlComponent,
    ClickOutsideDirective
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    StatusTitleComponent,
    MainLayoutComponent,
    HeaderComponent,
    ButtonComponent,
    MenuComponent,
    MenuControlComponent,
    ClickOutsideDirective
  ]
})
export class SharedModule { }
