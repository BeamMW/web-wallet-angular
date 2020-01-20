import { Action, createReducer, on, State } from '@ngrx/store';
import * as walletActions from '../actions/wallet.actions';
import { NumberSymbol } from '@angular/common';

export interface WalletAppState {
    activated: boolean;
    wasmInitiated: boolean;
    seedPhrase: string;
    walletData: any;
    walletStatus: any;
    receiveData: {
        amount: number,
        comment: string,
        address: string
    };
}

export const initialWalletAppState: WalletAppState = {
    activated: false,
    wasmInitiated: false,
    seedPhrase: '',
    walletData: '',
    walletStatus: {},
    receiveData: {
        amount: 0,
        comment: '',
        address: ''
    }
};

const reducerWalletApp = createReducer(
    initialWalletAppState,
    // on(walletActions.loadWalletState, (state, { walletState }) => ({ activated: walletState.activated })),
    on(walletActions.ChangeWalletState, (state, { walletState }) => ({ ...state, activated: walletState })),
    on(walletActions.ChangeWasmState, (state, { wasmState }) => ({ ...state, wasmInitiated: wasmState })),
    on(walletActions.addSeedPhrase, (state, { seedPhraseValue }) => ({ ...state, seedPhrase: seedPhraseValue })),
    on(walletActions.saveWallet, (state, { wallet }) => ({ ...state, walletData: wallet })),
    on(walletActions.saveWalletStatus, (state, { status }) => ({ ...state, walletStatus: status })),
    on(walletActions.saveReceiveData, (state, { receive }) => ({ ...state, receiveData: receive }))
);

export function reducer(state: WalletAppState | undefined, action: Action) {
    return reducerWalletApp(state, action);
}