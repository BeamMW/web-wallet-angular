import {
    createSelector,
    createFeatureSelector,
    ActionReducerMap,
  } from '@ngrx/store';
import * as fromWalletState from './../reducers/wallet-state.reducers';

export interface State {
    walletAppState: fromWalletState.WalletAppState;
}

export const selectAppState = (state: State) => state.walletAppState;

export const selectWalletState = createSelector(
  selectAppState,
  state => state.activated
);

export const selectWasmState = createSelector(
  selectAppState,
  state => state.wasmInitiated
);

export const selectSeedPhrase = createSelector(
  selectAppState,
  state => state.seedPhrase
);

export const selectWalletData = createSelector(
  selectAppState,
  state => state.walletData
);

export const selectWalletStatus = createSelector(
  selectAppState,
  state => state.walletStatus
);

export const selectReceiveData = createSelector(
  selectAppState,
  state => state.receiveData
);
