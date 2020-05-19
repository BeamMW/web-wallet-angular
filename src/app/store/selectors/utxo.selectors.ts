import {
    createSelector,
    createFeatureSelector,
    ActionReducerMap,
  } from '@ngrx/store';
import * as fromUtxo from './../reducers/utxo.reducers';
import { utxoStatuses } from '@consts';

export interface State {
    utxos: fromUtxo.UtxoState;
}

export const reducers: ActionReducerMap<State> = {
    utxos: fromUtxo.utxoReducer,
};

export const selectUtxoState = createFeatureSelector<fromUtxo.UtxoState>('utxos');

export const selectUtxoIds = createSelector(
    selectUtxoState,
    fromUtxo.selectUtxoIds // shorthand for usersState => fromUser.selectUserIds(usersState)
);

export const selectUtxoEntities = createSelector(
    selectUtxoState,
    fromUtxo.selectUtxoEntities
);

export const selectAllUtxo = createSelector(
    selectUtxoState,
    fromUtxo.selectAllUtxo
  );

export const selectUtxoTotal = createSelector(
    selectUtxoState,
    fromUtxo.selectUtxoTotal
);

export const selectAvailableUtxo = createSelector(
    selectAllUtxo,
    utxos => utxos.filter(utxo => utxo.status_string === utxoStatuses.AVAILABLE)
);

export const selectInProgressUtxo = createSelector(
    selectAllUtxo,
    utxos => utxos.filter(utxo => utxo.status_string === utxoStatuses.IN_PROGRESS ||
        utxo.status_string === utxoStatuses.INCOMING ||
        utxo.status_string === utxoStatuses.OUTGOING)
);

export const selectSpentUtxo = createSelector(
    selectAllUtxo,
    utxos => utxos.filter(utxo => utxo.status_string === utxoStatuses.SPENT)
);

export const selectUnavailableUtxo = createSelector(
    selectAllUtxo,
    utxos => utxos.filter(utxo => utxo.status_string === utxoStatuses.UNAVAILABLE)
);


export const selectUtxoById = (txId: string) => createSelector(
    selectAllUtxo,
    utxos => {
        return utxos.filter(utxo => utxo.createTxId === txId ||  utxo.spentTxId === txId);
    }
);
