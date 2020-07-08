import { createAction, props } from '@ngrx/store';
import { WalletState, Address, Utxo, Transaction, Contact } from '@app/models';

export const loadAddresses = createAction('[Addresses] Load Addresses', props<{ addresses: Address[] }>());
export const loadUtxo = createAction('[Utxos] Load Utxos', props<{ utxos: Utxo[] }>());
export const loadTr = createAction('[Transcations] Load Transcations', props<{ transactions: Transaction[] }>());

export const loadWalletState = createAction('[Wallet state] Load Wallet state', props<{ walletState: WalletState }>());
export const ChangeWalletState = createAction('[Wallet state] Change wallet state', props<{ walletState: boolean }>());
export const ChangeWasmState = createAction('[Wallet state] Change wasm state', props<{ wasmState: boolean }>());

export const addSeedPhrase = createAction('[Wallet state] Add seed phrase', props<{ seedPhraseValue: string }>());
export const saveWallet = createAction('[Wallet state] Save wallet', props<{ wallet: any }>());
export const saveWalletStatus = createAction('[Wallet state] Save wallet status', props<{ status: any }>());

export const saveReceiveData = createAction('[Wallet state] Save receive data', props<{ receive: any }>());
export const saveSendData = createAction('[Wallet state] Save send data', props<{ send: any }>());

export const needToReconnect = createAction('[Wallet state] Reconnect trigger', props<{ isNeedValue: boolean }>());

export const saveError = createAction('[Wallet state] Got an error message', props<{ errorValue: any }>());
/* Settings */
export const updatePrivacySetting = createAction('[Wallet state] Update privacy setting', props<{ settingValue: boolean }>());
export const updateSaveLogsSetting = createAction('[Wallet state] Update save logs setting', props<{ settingValue: number }>());
export const updateCurrencySetting = createAction('[Wallet state] Update currency setting', props<{ settingValue: any }>());
export const updateDnsSetting = createAction('[Wallet state] Update dns setting', props<{ settingValue: string }>());
export const updateIpSetting = createAction('[Wallet state] Update ip setting', props<{ settingValue: string }>());
export const updateVerificatedSetting = createAction('[Wallet state] Update verificated setting', props<{ settingValue: any }>());
export const updatePasswordCheckSetting = createAction('[Wallet state] Update password check setting', props<{ settingValue: boolean }>());

/* Contact list */
export const saveContact = createAction('[Wallet state] Save contact', props<Contact>());

/* Proof export data */
export const saveProofData = createAction('[Wallet state] Save proof data', props<{ proofData: any }>());