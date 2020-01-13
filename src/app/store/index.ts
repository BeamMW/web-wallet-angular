import { Type } from '@angular/core';

import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer
} from '@ngrx/store';

import * as addressReducers from './reducers/address.reducers';
import * as utxoReducers from './reducers/utxo.reducers';
import * as trReducers from './reducers/transaction.reducers';
import * as walletStateReducers from './reducers/wallet-state.reducers';


export interface State {
    addresses: addressReducers.AddressesState;
    utxos: utxoReducers.UtxoState;
    transactions: trReducers.TrState;
    walletAppState: walletStateReducers.WalletAppState;
}

export const reducers: ActionReducerMap<State> = {
  addresses: addressReducers.walletReducer,
  utxos: utxoReducers.utxoReducer,
  transactions: trReducers.trReducer,
  walletAppState: walletStateReducers.reducer
};

export const metaReducers: MetaReducer<State>[] = [];
