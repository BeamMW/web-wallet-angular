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
    privacySetting: boolean;
    saveLogsSetting: number;
    currencySetting: number;
    dnsSetting: string;
    ipSetting: string;
    passwordCheck: boolean;
    verificatedSetting: boolean;
    sendData: {
        address: string,
        fee: number,
        amount: number,
        comment: string
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
    },
    privacySetting: false,
    saveLogsSetting: 0,
    currencySetting: 0,
    dnsSetting: '',
    ipSetting: '3.222.86.179:20000',
    verificatedSetting: false,
    passwordCheck: true,
    sendData: {
        address: '',
        fee: 100,
        amount: 0,
        comment: ''
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
    on(walletActions.saveReceiveData, (state, { receive }) => ({ ...state, receiveData: receive })),
    on(walletActions.saveSendData, (state, { send }) => ({ ...state, sendData: send })),

    /* Settings */
    on(walletActions.updatePrivacySetting, (state, { settingValue }) => ({ ...state, privacySetting: settingValue })),
    on(walletActions.updateSaveLogsSetting, (state, { settingValue }) => ({ ...state, saveLogsSetting: settingValue })),
    on(walletActions.updateCurrencySetting, (state, { settingValue }) => ({ ...state, currencySetting: settingValue })),
    on(walletActions.updateDnsSetting, (state, { settingValue }) => ({ ...state, dnsSetting: settingValue })),
    on(walletActions.updateIpSetting, (state, { settingValue }) => ({ ...state, ipSetting: settingValue })),
    on(walletActions.updateVerificatedSetting, (state, { settingValue }) => ({ ...state, verificatedSetting: settingValue })),
    on(walletActions.updatePasswordCheckSetting, (state, { settingValue }) => ({ ...state, passwordCheck: settingValue }))
);

export function reducer(state: WalletAppState | undefined, action: Action) {
    return reducerWalletApp(state, action);
}