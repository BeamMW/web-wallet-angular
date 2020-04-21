import { Injectable } from '@angular/core';
import * as ObservableStore from 'obs-store';
import { Subject } from 'rxjs';
import * as extensionizer from 'extensionizer';
import { WalletState } from './../models/wallet-state.model';
import { Store, select } from '@ngrx/store';
import {
  selectAppState,
  selectWalletSetting,
  selectContacts
} from '../store/selectors/wallet-state.selectors';
import {
  loadWalletState,
  saveWallet,
  ChangeWalletState,
  updatePrivacySetting,
  updateCurrencySetting,
  updateDnsSetting,
  updateIpSetting,
  updateSaveLogsSetting,
  updateVerificatedSetting,
  updatePasswordCheckSetting,
  saveContact } from '../store/actions/wallet.actions';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  sendStore: any;
  options$: Observable<any>;
  appState$: Observable<any>;

  // Observable string sources
  private emitChangeSource = new Subject<any>();
  // Observable string streams
  changeEmitted$ = this.emitChangeSource.asObservable();
  // Service message commands
  emitChange(change: any) {
      this.emitChangeSource.next(change);
  }

  constructor(private store: Store<any>) {
    // TODO: remove!!!
    this.sendStore = new ObservableStore();

    this.loadWalletData().then(walletData => {
      if (walletData !== undefined && walletData.length > 0) {
          console.log('Wallet: ', walletData);
          this.store.dispatch(saveWallet({wallet: walletData}));
          this.store.dispatch(ChangeWalletState({walletState: true}));
      }
    });
  }

  public settingsInit(seedConfirmed: boolean) {
    extensionizer.storage.local.set({
      settings: {
        privacySetting: false,
        saveLogsSetting: 0,
        currencySetting: 0,
        dnsSetting: '',
        ipSetting: '3.222.86.179:20000',
        verificatedSetting: seedConfirmed,
        passwordCheck: true
    }});
  }

  public saveWallet(data) {
    this.store.dispatch(saveWallet({wallet: data}));
    extensionizer.storage.local.set({wallet: data});
  }

  public saveAppState(value) {
    extensionizer.storage.local.set({state: value});
  }

  public saveWalletOptions() {
    this.options$ = this.store.pipe(select(selectWalletSetting));
    this.options$.subscribe((state) => {
      extensionizer.storage.local.set({settings: state});
    });
  }

  public saveWalletContacts() {
    this.options$ = this.store.pipe(select(selectContacts));
    this.options$.subscribe((state) => {
      extensionizer.storage.local.set({contacts: state});
    });
  }

  loadAppState() {
    return new Promise<WalletState>((resolve, reject) => {
      extensionizer.storage.local.get('state', (result) => {
        resolve(result.state);
      });
    });
  }

  loadWalletData() {
    return new Promise<string>((resolve, reject) => {
      extensionizer.storage.local.get('wallet', (result) => {
        resolve(result.wallet);
      });
    });
  }

  loadContacts() {
    return new Promise<any>((resolve, reject) => {
      extensionizer.storage.local.get('contacts', (result) => {
        resolve(result.contacts);
      });
    });
  }

  loadSettingsFromStore() {
    return new Promise<any>((resolve, reject) => {
      extensionizer.storage.local.get('settings', (result) => {
        resolve(result.settings);
      });
    });
  }

  loadWalletSettings() {
    this.loadSettingsFromStore().then(settingsData => {
      this.store.dispatch(updatePrivacySetting({settingValue: settingsData.privacySetting}));
      this.store.dispatch(updateVerificatedSetting({settingValue: settingsData.verificatedSetting}));
      this.store.dispatch(updateSaveLogsSetting({settingValue: settingsData.saveLogsSetting}));
      this.store.dispatch(updateDnsSetting({settingValue: settingsData.dnsSetting}));
      this.store.dispatch(updateIpSetting({settingValue: settingsData.ipSetting}));
      this.store.dispatch(updateCurrencySetting({settingValue: settingsData.currencySetting}));
      this.store.dispatch(updatePasswordCheckSetting({settingValue: settingsData.passwordCheck}));
    });
  }

  loadWalletContacts() {
    this.loadContacts().then(contacts => {
      if (contacts !== undefined && contacts.length > 0) {
        contacts.forEach(element => {
          this.store.dispatch(saveContact({name: element.name, address: element.address}));
        });
      }
    });
  }
}
