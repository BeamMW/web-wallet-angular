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

export const selectTrTotal = createSelector(
    selectTrState,
    fromTr.selectTrTotal
);
