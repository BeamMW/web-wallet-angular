import { createAction, props } from '@ngrx/store';
import { Address } from './../../models/address';
import { Utxo } from './../../models/utxo.model';
import { Transaction } from '@app/models/transactions.model';

export const loadAddresses = createAction('[Addresses] Load Addresses', props<{ addresses: Address[] }>());
export const loadUtxo = createAction('[Utxos] Load Utxos', props<{ utxos: Utxo[] }>());
export const loadTr = createAction('[Transcations] Load Transcations', props<{ transactions: Transaction[] }>());
