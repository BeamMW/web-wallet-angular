import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';
import { MainComponent, LoginComponent } from './containers';

import { WalletRoutingModule } from './wallet-routing.module';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { BeamPipe } from 'app/pipes/beam.pipe';
import { DecimalPipe } from '@angular/common';

import { SendComponent } from './pages/send/send.component';

@NgModule({
  declarations: [
    MainComponent,
    LoginComponent,
    LoginFormComponent,
    SendComponent,
    BeamPipe
  ],
  providers: [
    DecimalPipe
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
