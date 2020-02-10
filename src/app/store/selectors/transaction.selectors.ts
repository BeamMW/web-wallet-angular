import {
    createSelector,
    createFeatureSelector,
    ActionReducerMap,
  } from '@ngrx/store';
import * as fromTr from './../reducers/transaction.reducers';

export interface State {
    transactions: fromTr.TrState;
}

export const reducers: ActionReducerMap<State> = {
    transactions: fromTr.trReducer,
};

export const selectTrState = createFeatureSelector<fromTr.TrState>('transactions');

export const selectTrIds = createSelector(
    selectTrState,
    fromTr.selectTrIds // shorthand for usersState => fromUser.selectUserIds(usersState)
);

export const selectTrEntities = createSelector(
    selectTrState,
    fromTr.selectTrEntities
);

export const selectAllTr = createSelector(
    selectTrState,
    fromTr.selectAllTr
);

export const selectInProgressTr = createSelector(
    selectAllTr,
    transactions => transactions.filter(transaction => transaction.status_string === 'receiving' ||
        transaction.status_string === 'sending')
);

export const selectSentTr = createSelector(
    selectAllTr,
    transactions => transactions.filter(transaction => transaction.status_string === 'sent')
);

export const selectReceivedTr = createSelector(
    selectAllTr,
    transactions => transactions.filter(transaction => transaction.status_string === 'received')
);

export const selectTrTotal = createSelector(
    selectTrState,
    fromTr.selectTrTotal
);

export const selectTrByAddress = (address: string) => createSelector(
    selectAllTr,
    allTr => {
        return allTr
            .filter(transactions => transactions.sender === address || transactions.receiver === address);
    }
);

export const selectTrById = (txId: string) => createSelector(
    selectAllTr,
    allTr => {
        return allTr
            .find(transactions => transactions.txId === txId);
    }
);

export const selectTrsById = (txId: string) => createSelector(
    selectAllTr,
    allTr => {
        return allTr
            .filter(transactions => transactions.txId === txId);
    }
);
