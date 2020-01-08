import { Transaction } from '../../models/transactions.model';
import { Action, createReducer, on, State } from '@ngrx/store';
import * as walletActions from '../actions/wallet.actions';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

export interface TrState extends EntityState<Transaction> {
    allTrLoaded: boolean;
}

export const adapterTr: EntityAdapter<Transaction> = createEntityAdapter<Transaction>({
    selectId: (transactions: Transaction) => transactions.txId
});

export const initialTrState: TrState = adapterTr.getInitialState({
    allTrLoaded: false
});

const reducerTr = createReducer(
    initialTrState,
    on(walletActions.loadTr, (state, { transactions }) => {
      return adapterTr.addAll(transactions, state);
    }),
);

export function trReducer(state = initialTrState, action: Action): TrState {
    return reducerTr(state, action);
}

// get the selectors
const {
    selectIds,
    selectEntities,
    selectAll,
    selectTotal,
} = adapterTr.getSelectors();

export const selectTrIds = selectIds;

export const selectTrEntities = selectEntities;

export const selectAllTr = selectAll;

export const selectTrTotal = selectTotal;
