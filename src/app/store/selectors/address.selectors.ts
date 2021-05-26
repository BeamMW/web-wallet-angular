import { createSelector } from '@ngrx/store';
import * as fromAddressesState from './../reducers/address.reducers';

// export interface State {
//   addressesState: AddressesState;
// }

// const getAddressValidationState = (state: AddressesState): any => state.addressValidation;

// export const selectAddressValidationData = createSelector(
//   (state: {rootState: AddressesState}) => state.rootState,
//   getAddressValidationState
// );

export interface State {
  addressesState: fromAddressesState.AddressesState;
}

export const selectAppState = (state: State) => state.addressesState;

// export const selectAddressValidationData = createSelector(
// selectAppState,
// state => state.addressValidation
// );



// export const selectAddressIds = createSelector(
//   selectAddressState,
//   fromAddress.selectAddressIds // shorthand for usersState => fromUser.selectUserIds(usersState)
// );

// export const selectUserEntities = createSelector(
//   selectAddressState,
//   fromAddress.selectAddressEntities
// );

// export const selectAllAddresses = createSelector(
//   selectAddressState,
//   fromAddress.selectAllAddresses
// );

// export const selectAddressTotal = createSelector(
//   selectAddressState,
//   fromAddress.selectAddressesTotal
// );

// export const selectActiveAddresses = createSelector(
//   selectAllAddresses,
//   addresses => addresses.filter(address => !address.expired)
// );

// export const selectExpiredAddresses = createSelector(
//   selectAllAddresses,
//   addresses => addresses.filter(address => address.expired)
// );


// export const selectAddress = (address: string) => createSelector(
//   selectAllAddresses,
//   allAddresses => {
//     return allAddresses
//             .find(addressValue => addressValue.address === address);
//   }
// );