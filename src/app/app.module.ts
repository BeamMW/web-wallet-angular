import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';
import { environment } from '../environments/environment';
import { RouterModule } from '@angular/router';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FirstTimeFlowModule } from './modules/first-time-flow/first-time-flow.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { SendModule } from './modules/send/send.module';
import { StorageModule } from '@ngx-pwa/local-storage';
import { TransactionsModule } from './modules/transactions/transactions.module';

import { EffectsModule } from '@ngrx/effects';
import { WalletEffects } from './store/effects/wallet.effects';
import * as walletReducer from './store/index';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { DatePipe } from '@angular/common';

@NgModule({
  entryComponents: [],
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    FirstTimeFlowModule,
    WalletModule,
    SendModule,
    TransactionsModule,
    StoreModule.forRoot(walletReducer.reducers, {
      runtimeChecks: {
        strictStateImmutability: false, 
        strictActionImmutability: false,
      }
    }),
    EffectsModule.forRoot([WalletEffects]),
    StorageModule.forRoot({ IDBNoWrap: true }),
    StoreRouterConnectingModule.forRoot(),
    RouterModule
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
