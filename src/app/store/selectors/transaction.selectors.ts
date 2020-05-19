import {
    createSelector,
    createFeatureSelector,
    ActionReducerMap,
  } from '@ngrx/store';
import * as fromTr from './../reducers/transaction.reducers';
import { transactionsStatuses } from '@consts';

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
    transactions => transactions.filter(transaction => transaction.status_string === transactionsStatuses.RECEIVING ||
        transaction.status_string === transactionsStatuses.IN_PROGRESS ||
        transaction.status_string === transactionsStatuses.WAITING_FOR_RECEIVER ||
        transaction.status_string === transactionsStatuses.WAITING_FOR_SENDER ||
        transaction.status_string === transactionsStatuses.SENDING ||
        transaction.status_string === transactionsStatuses.PENDING ||
        transaction.status_string === transactionsStatuses.SELF_SENDING ||
        transaction.status_string === transactionsStatuses.SENT_TO_OWN_ADDRESS)
);

export const selectSentTr = createSelector(
    selectAllTr,
    transactions => transactions.filter(transaction => transaction.status_string === transactionsStatuses.SENT)
);

export const selectReceivedTr = createSelector(
    selectAllTr,
    transactions => transactions.filter(transaction => transaction.status_string === transactionsStatuses.RECEIVED)
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
