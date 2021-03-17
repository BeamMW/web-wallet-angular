import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';
import { MainComponent, LoginComponent } from './containers';

import { WalletRoutingModule } from './wallet-routing.module';

import { LoginGuard } from './guards/login.guard';
import { InitializeGuard } from './guards/initialize.guard';
import { RestorePopupComponent } from './components/restore-popup/restore-popup.component';

@NgModule({
  declarations: [
    MainComponent,
    LoginComponent,
    RestorePopupComponent
  ],
  providers: [
    LoginGuard,
    InitializeGuard
  ],
  imports: [
    SharedModule,
    CommonModule,
    WalletRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class WalletModule { }
