import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsRoutingModule } from './settings-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import {
  SettingsMainComponent,
  GeneralComponent,
  ServerComponent,
  PrivacyComponent,
  UtilitiesComponent
 } from './containers';
import {
  RemoveWalletPopupComponent,
  RemoveWalletConfirmationPopupComponent,
  ClearWalletPopupComponent,
  EnterIpPopupComponent,
  EnterDnsPopupComponent,
  CheckPassConfirmationPopupComponent,
  ChangePasswordPopupComponent,
  ReportPopupComponent,
  ShowOwnerKeyPopupComponent
} from './components';

import {
  MatSlideToggleModule
} from '@angular/material/slide-toggle';

@NgModule({
  declarations: [
    SettingsMainComponent,
    GeneralComponent,
    ServerComponent,
    PrivacyComponent,
    UtilitiesComponent,
    RemoveWalletPopupComponent,
    RemoveWalletConfirmationPopupComponent,
    ClearWalletPopupComponent,
    EnterIpPopupComponent,
    EnterDnsPopupComponent,
    CheckPassConfirmationPopupComponent,
    ChangePasswordPopupComponent,
    ReportPopupComponent,
    ShowOwnerKeyPopupComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    SettingsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatSlideToggleModule
  ]
})
export class SettingsModule { }
