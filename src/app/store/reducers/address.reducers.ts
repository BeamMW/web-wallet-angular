import { Address } from '../../models/address.model';
import { Action, createReducer, on, State } from '@ngrx/store';
import * as walletActions from '../actions/wallet.actions';

export interface AddressesState {
  allAddressesLoaded: boolean;
  // addressValidation: {
  //   is_mine: boolean
  //   is_valid: boolean
  //   type: string
  // };
  addresses: Address[];
}

export const initialAddrState: AddressesState = {
  allAddressesLoaded: false,
  //addressValidation: null,
  addresses: null
};

const reducerAddresses = createReducer(
  initialAddrState,
  on(walletActions.loadAddresses, (state, { addresses }) => ({ ...state, addresses: addresses })),
  //on(walletActions.addressValidationLoaded, (state, { validationData }) => ({ ...state, addressValidation: validationData })),
);

export function addressesReducer(state: AddressesState | undefined, action: Action) {
  return reducerAddresses(state, action);
}