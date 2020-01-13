import { Address } from '../../models/address.model';
import { Action, createReducer, on, State } from '@ngrx/store';
import * as walletActions from '../actions/wallet.actions';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Utxo } from '@app/models/utxo.model';

export interface UtxoState extends EntityState<Utxo> {
    allUtxoLoaded: boolean;
}

export const adapterUtxo: EntityAdapter<Utxo> = createEntityAdapter<Utxo>({
    selectId: (utxo: Utxo) => utxo.id
});

export const initialUtxoState: UtxoState = adapterUtxo.getInitialState({
    allUtxoLoaded: false
});

const reducerUtxo = createReducer(
    initialUtxoState,
    on(walletActions.loadUtxo, (state, { utxos }) => {
      return adapterUtxo.addAll(utxos, state);
    }),
);

export function utxoReducer(state = initialUtxoState, action: Action): UtxoState {
    return reducerUtxo(state, action);
}

// get the selectors
const {
    selectIds,
    selectEntities,
    selectAll,
    selectTotal,
} = adapterUtxo.getSelectors();

export const selectUtxoIds = selectIds;

export const selectUtxoEntities = selectEntities;

export const selectAllUtxo = selectAll;

export const selectUtxoTotal = selectTotal;