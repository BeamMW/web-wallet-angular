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


@NgModule({
  declarations: [
    SettingsMainComponent,
    GeneralComponent,
    ServerComponent,
    PrivacyComponent,
    UtilitiesComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    SettingsRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class SettingsModule { }
