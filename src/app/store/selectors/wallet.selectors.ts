import {
  createSelector,
  createFeatureSelector,
  ActionReducerMap,
} from '@ngrx/store';
import * as fromWallet from './../reducers/wallet.reducers';

export interface State {
  addresses: fromWallet.WalletState;
}

export const reducers: ActionReducerMap<State> = {
  addresses: fromWallet.walletReducer,
};

export const selectAddressState = createFeatureSelector<fromWallet.WalletState>('addresses');

export const selectAddressIds = createSelector(
  selectAddressState,
  fromWallet.selectAddressIds // shorthand for usersState => fromUser.selectUserIds(usersState)
);

export const selectUserEntities = createSelector(
  selectAddressState,
  fromWallet.selectAddressEntities
);

export const selectAllAddresses = createSelector(
  selectAddressState,
  fromWallet.selectAllAddresses
);

export const selectAddressTotal = createSelector(
  selectAddressState,
  fromWallet.selectAddressesTotal
);

export const selectActiveAddresses = createSelector(
  selectAllAddresses,
  addresses => addresses.filter(address => !address.expired)
);

export const selectExpiredAddresses = createSelector(
  selectAllAddresses,
  addresses => addresses.filter(address => address.expired)
);

export const selectAddress = (address: String) => createSelector(
  selectAllAddresses,
  allAddresses => {
    return allAddresses
            .filter(addressValue => addressValue.address === address);
  }
);