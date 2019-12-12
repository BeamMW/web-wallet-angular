import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';
import { MainComponent, LoginComponent } from './containers';

import { WalletRoutingModule } from './wallet-routing.module';
import { LoginFormComponent } from './components/login-form/login-form.component';

import {
  MatExpansionModule,
  MatButtonModule,
  MatCheckboxModule,
  MatIconModule,
  MatTabsModule,
  MatSortModule,
  MatListModule,
  MatCardModule,
  MatProgressBarModule,
  MatTableModule,
  MatToolbarModule,
  MatInputModule,
  MatFormFieldModule,
  MatPaginatorModule,
  MatSidenavModule,
  MatDialogModule,
} from '@angular/material';
import { SendComponent } from './pages/send/send.component';
import { MenuComponent } from './components/main/menu/menu.component';

@NgModule({
  declarations: [
    MainComponent,
    LoginComponent,
    LoginFormComponent,
    SendComponent,
    MenuComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    WalletRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    // Material
    MatExpansionModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatTabsModule,
    MatSortModule,
    MatListModule,
    MatCardModule,
    MatProgressBarModule,
    MatTableModule,
    MatToolbarModule,
    MatInputModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatSidenavModule,
    MatDialogModule,
  ]
})
export class WalletModule { }
