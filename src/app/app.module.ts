import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';
import { reducers, metaReducers } from './store/reducers';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';


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

import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './shared/shared.module';
import { WalletComponent } from './components/wallet/wallet.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { WalletAddressesComponent, WalletAddressEditComponent } from './components/wallet-addresses/wallet-addresses.component';
import { WalletUtxoComponent } from './components/wallet-utxo/wallet-utxo.component';
import { WalletTransactionsComponent } from './components/wallet-transactions/wallet-transactions.component';
import { WalletManagerComponent, WalletManagerDialogComponent } from './components/wallet-manager/wallet-manager.component';
import { ReceiveComponent } from './components/receive/receive.component';
import { SendComponent } from './components/send/send.component';
import { SendSwapComponent } from './components/send-swap/send-swap.component';


@NgModule({
  entryComponents: [
    WalletManagerComponent,
    WalletManagerDialogComponent,
    WalletAddressEditComponent
  ],
  declarations: [
    AppComponent,
    WalletComponent,
    WalletAddressesComponent,
    WalletUtxoComponent,
    WalletTransactionsComponent,
    WalletManagerComponent,
    WalletManagerDialogComponent,
    WalletAddressEditComponent,
    ReceiveComponent,
    SendComponent,
    SendSwapComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    StoreModule.forRoot(reducers, {
      metaReducers,
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true,
      }
    }),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    HttpClientModule,
    BrowserAnimationsModule,
    SharedModule,
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
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
