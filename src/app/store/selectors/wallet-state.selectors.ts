import {
    createSelector,
    createFeatureSelector,
    ActionReducerMap,
  } from '@ngrx/store';
import * as fromWalletState from './../reducers/wallet-state.reducers';

export interface State {
    walletAppState: fromWalletState.WalletAppState;
}

export const selectAppState = (state: State) => state.walletAppState;

export const selectWalletState = createSelector(
  selectAppState,
  state => state.activated
);

export const selectWasmState = createSelector(
  selectAppState,
  state => state.wasmInitiated
);

export const selectSeedPhrase = createSelector(
  selectAppState,
  state => state.seedPhrase
);

export const selectWalletData = createSelector(
  selectAppState,
  state => state.walletData
);

export const selectWalletStatus = createSelector(
  selectAppState,
  state => state.walletStatus
);

export const selectReceiveData = createSelector(
  selectAppState,
  state => state.receiveData
);

export const selectSendData = createSelector(
  selectAppState,
  state => state.sendData
);

export const selectError = createSelector(
  selectAppState,
  state => state.error
);

/* Settings */
export const selectPrivacySetting = createSelector(
  selectAppState,
  state => state.privacySetting
);

export const selectSaveLogsSetting = createSelector(
  selectAppState,
  state => state.saveLogsSetting
);

export const selectCurrencySetting = createSelector(
  selectAppState,
  state => state.currencySetting
);

export const selectDnsSetting = createSelector(
  selectAppState,
  state => state.dnsSetting
);

export const selectIpSetting = createSelector(
  selectAppState,
  state => state.ipSetting
);

export const selectVerificatedSetting = createSelector(
  selectAppState,
  state => state.verificatedSetting
);

export const selectPasswordCheckSetting = createSelector(
  selectAppState,
  state => state.passwordCheck
);

export const selectWalletSetting = createSelector(
  selectAppState,
  state => {
    return {
      verificatedSetting: state.verificatedSetting,
      ipSetting: state.ipSetting,
      dnsSetting: state.dnsSetting,
      currencySetting: state.currencySetting,
      saveLogsSetting: state.saveLogsSetting,
      privacySetting: state.privacySetting,
      passwordCheck: state.passwordCheck
    };
  }
);

export const selectContacts = createSelector(
  selectAppState,
  state => state.contacts
);

export const selectContact  = (address: string) => createSelector(
  selectAppState,
  state => {
    return state.contacts
            .find(contact => contact.address === address);
  }
);

export const selectProofData = createSelector(
  selectAppState,
  state => state.proofDataValue
);

export const selectIsNeedToReconnect = createSelector(
  selectAppState,
  state => state.isNeedToReconnect
);
