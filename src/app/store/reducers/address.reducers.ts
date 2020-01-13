import { Address } from '../../models/address.model';
import { Action, createReducer, on, State } from '@ngrx/store';
import * as walletActions from '../actions/wallet.actions';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

export interface AddressesState extends EntityState<Address> {
  allAddressesLoaded: boolean;
}

export const adapter: EntityAdapter<Address> = createEntityAdapter<Address>({
  selectId: (address: Address) => address.address
});

export const initialState: AddressesState = adapter.getInitialState({
  allAddressesLoaded: false
});

const reducer = createReducer(
  initialState,
  on(walletActions.loadAddresses, (state, { addresses }) => {
    return adapter.addAll(addresses, state);
  }),

);

export function walletReducer(state = initialState, action: Action): AddressesState {
  return reducer(state, action);
}

// get the selectors
const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors();

export const selectAddressIds = selectIds;

export const selectAddressEntities = selectEntities;

export const selectAllAddresses = selectAll;

export const selectAddressesTotal = selectTotal;
