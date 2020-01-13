import {
  createSelector,
  createFeatureSelector,
  ActionReducerMap,
} from '@ngrx/store';
import * as fromAddress from '../reducers/address.reducers';

export interface State {
  addresses: fromAddress.AddressesState;
}

export const reducers: ActionReducerMap<State> = {
  addresses: fromAddress.walletReducer,
};

export const selectAddressState = createFeatureSelector<fromAddress.AddressesState>('addresses');

export const selectAddressIds = createSelector(
  selectAddressState,
  fromAddress.selectAddressIds // shorthand for usersState => fromUser.selectUserIds(usersState)
);

export const selectUserEntities = createSelector(
  selectAddressState,
  fromAddress.selectAddressEntities
);

export const selectAllAddresses = createSelector(
  selectAddressState,
  fromAddress.selectAllAddresses
);

export const selectAddressTotal = createSelector(
  selectAddressState,
  fromAddress.selectAddressesTotal
);

export const selectActiveAddresses = createSelector(
  selectAllAddresses,
  addresses => addresses.filter(address => !address.expired)
);

export const selectExpiredAddresses = createSelector(
  selectAllAddresses,
  addresses => addresses.filter(address => address.expired)
);

export const selectAddress = (address: string) => createSelector(
  selectAllAddresses,
  allAddresses => {
    return allAddresses
            .find(addressValue => addressValue.address === address);
  }
);