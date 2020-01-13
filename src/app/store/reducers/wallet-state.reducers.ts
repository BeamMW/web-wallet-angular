import { Action, createReducer, on, State } from '@ngrx/store';
import * as walletActions from '../actions/wallet.actions';

export interface WalletAppState {
    activated: boolean;
    wasmInitiated: boolean;
    seedPhrase: string;
    walletData: any;
    walletStatus: any;
}

export const initialWalletAppState: WalletAppState = {
    activated: false,
    wasmInitiated: false,
    seedPhrase: '',
    walletData: '',
    walletStatus: {}
};

const reducerWalletApp = createReducer(
    initialWalletAppState,
    // on(walletActions.loadWalletState, (state, { walletState }) => ({ activated: walletState.activated })),
    on(walletActions.ChangeWalletState, (state, { walletState }) => ({ ...state, activated: walletState })),
    on(walletActions.ChangeWasmState, (state, { wasmState }) => ({ ...state, wasmInitiated: wasmState })),
    on(walletActions.addSeedPhrase, (state, { seedPhraseValue }) => ({ ...state, seedPhrase: seedPhraseValue })),
    on(walletActions.saveWallet, (state, { wallet }) => ({ ...state, walletData: wallet })),
    on(walletActions.saveWalletStatus, (state, { status }) => ({ ...state, walletStatus: status }))
);

export function reducer(state: WalletAppState | undefined, action: Action) {
    return reducerWalletApp(state, action);
}