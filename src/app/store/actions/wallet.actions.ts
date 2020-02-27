import { createAction, props } from '@ngrx/store';
import { WalletState, Address, Utxo, Transaction } from '@app/models';

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

export const optionsUpdate = createAction('[Wallet state] Update wallet options', props<{ options: any }>());
