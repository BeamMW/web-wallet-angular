import { Action } from '@ngrx/store';

export enum WalletActionTypes {
  LoadWallets = '[Wallet] Load Wallets'
}

export class LoadWallets implements Action {
  readonly type = WalletActionTypes.LoadWallets;
}


export type WalletActions = LoadWallets;
