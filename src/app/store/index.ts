import { Type } from '@angular/core';

import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer
} from '@ngrx/store';

import * as walletReducers from './reducers/wallet.reducers';
import * as utxoReducers from './reducers/utxo.reducers';
import * as trReducers from './reducers/transaction.reducers';
import { trReducer } from './reducers/transaction.reducers';


export interface State {
    addresses: walletReducers.WalletState;
    utxos: utxoReducers.UtxoState;
    transactions: trReducers.TrState;
}

export const reducers: ActionReducerMap<State> = {
  addresses: walletReducers.walletReducer,
  utxos: utxoReducers.utxoReducer,
  transactions: trReducers.trReducer
};

export const metaReducers: MetaReducer<State>[] = [];
