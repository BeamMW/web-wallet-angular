import { Injectable } from '@angular/core';
import { Subject, from, Subscription, Observable, Subscribable } from 'rxjs';
import * as extensionizer from 'extensionizer';
import { WalletState } from './../models/wallet-state.model';
import { Store, select } from '@ngrx/store';
import {
  selectAppState,
  selectWalletSetting,
  selectContacts,
  selectIsNeedToReconnect,
  selectVerificatedSetting
} from '../store/selectors/wallet-state.selectors';
import {
  loadWalletState,
  loadAddresses,
  loadUtxo,
  loadTr,
  saveWalletStatus,
  saveWallet,
  ChangeWalletState,
  updatePrivacySetting,
  updateCurrencySetting,
  updateDnsSetting,
  updateIpSetting,
  updateSaveLogsSetting,
  updateVerificatedSetting,
  updatePasswordCheckSetting,
  needToReconnect,
  saveSendData,
  saveError,
  saveContact } from '../store/actions/wallet.actions';
import { Router } from '@angular/router';
import { WasmService } from './wasm.service';
import { LogService } from './log.service';
import * as passworder from 'browser-passworder';
import { routes, globalConsts, rpcMethodIdsConsts } from '@consts';
import * as ObservableStore from 'obs-store';


import { selectWasmState } from '../store/selectors/wallet-state.selectors';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  options$: Observable<any>;
  appState$: Observable<any>;
  private needToReconnect$: Observable<any>;

  private subManager = {
    loginProcessSub: new Subscription(),
    openWalletSub: new Subscription(),
    statusSub: new Subscription(),
    addressesSub: new Subscription(),
    utxoSub: new Subscription(),
    trsSub: new Subscription(),
    sendTrSub: new Subscription(),
    changePassSub: new Subscription(),
    txDeleteSub: new Subscription(),
    txCancelSub: new Subscription()
  };

  wasmState$: Observable<any>;

  refreshIntervalStatus = false;
  private refreshIntervalId;
  private refreshReconnectIntervalId;

  private walletParams = {
    seed: '',
    pass: '',
    walletId: ''
  };

  public getCoinsState = new ObservableStore(false);
  public clickedElement: HTMLElement;
  // Observable string sources
  private emitChangeSource = new Subject<any>();
  // Observable string streams
  changeEmitted$ = this.emitChangeSource.asObservable();
  // Service message commands
  emitChange(change: any) {
      this.emitChangeSource.next(change);
  }

  constructor(
    private logService: LogService,
    public router: Router,
    private wasmService: WasmService,
    private store: Store<any>) {

    this.needToReconnect$ = this.store.pipe(select(selectIsNeedToReconnect));
    this.needToReconnect$.subscribe((state) => {
      if (state) {
        this.refreshReconnectIntervalId = setInterval(() => {
          this.disconnectWallet();
          clearInterval(this.refreshIntervalId);
          this.loginToService(this.walletParams.seed, true, this.walletParams.walletId, this.walletParams.pass);
          console.log('[reconnecting...]');
          this.logService.saveDataToLogs('[Wallet testnet: reconnecting triggered]', '');
        }, 10000);
      }
    });
  }

  public settingsInit(seedConfirmed: boolean) {
    extensionizer.storage.local.set({
      settings: {
        privacySetting: false,
        saveLogsSetting: 0,
        currencySetting: {
          value: 0,
          updated: new Date().getTime()
        },
        dnsSetting: 'wallet-service.beam.mw',
        ipSetting: '3.222.86.179:20000',
        verificatedSetting: {
          state: seedConfirmed,
          isMessageClosed: false,
          balanceWasPositive: false,
          balanceWasPositiveMoreEn: false
        },
        passwordCheck: true
    }});
  }

  public saveWallet(data) {
    extensionizer.storage.local.remove(['wallet']);
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
    }).unsubscribe();
  }

  public saveWalletContacts() {
    this.options$ = this.store.pipe(select(selectContacts));
    this.options$.subscribe((state) => {
      extensionizer.storage.local.set({contacts: state});
    }).unsubscribe();
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
      this.store.dispatch(updateVerificatedSetting({settingValue: {
        state: settingsData.verificatedSetting.state,
        isMessageClosed: settingsData.verificatedSetting.isMessageClosed,
        balanceWasPositive: settingsData.verificatedSetting.balanceWasPositive,
        balanceWasPositiveMoreEn: settingsData.verificatedSetting.balanceWasPositiveMoreEn
      }}));
      this.store.dispatch(updateSaveLogsSetting({settingValue: settingsData.saveLogsSetting}));
      this.store.dispatch(updateDnsSetting({settingValue: settingsData.dnsSetting}));
      this.store.dispatch(updateIpSetting({settingValue: settingsData.ipSetting}));
      this.store.dispatch(updateCurrencySetting({settingValue: {
        value: settingsData.currencySetting.value,
        updated: settingsData.currencySetting.updated,
      }}));
      this.store.dispatch(updatePasswordCheckSetting({settingValue: settingsData.passwordCheck}));
    });
  }

  updateVerificatedSettingOnInit() {
    this.store.dispatch(updateVerificatedSetting({settingValue: {
      state: true,
      isMessageClosed: false,
      balanceWasPositive: false,
      balanceWasPositiveMoreEn: false
    }}));
  }

  public activateWallet() {
    this.loadWalletData().then(walletData => {
      if (walletData !== undefined && walletData.length > 0) {
          console.log('Wallet: ', walletData);
          this.logService.saveDataToLogs('[Wallet testnet: Activated]', walletData);
          this.store.dispatch(saveWallet({wallet: walletData}));
          this.store.dispatch(ChangeWalletState({walletState: true}));
      }
    });
  }

  public disconnectWallet() {
  }

  public deactivateWallet() {
    clearInterval(this.refreshIntervalId);
    this.disconnectWallet();
    this.getCoinsState.putState(false);
    this.store.dispatch(saveWallet({wallet: {}}));
    this.store.dispatch(ChangeWalletState({walletState: false}));
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

  clearWalletData() {
    clearInterval(this.refreshIntervalId);
    this.wasmService.deleteWalletDB();
    extensionizer.storage.local.remove(['settings', 'wallet', 'contacts', 'state']);
  }

  loginToService(seed: string, loginToWallet: boolean = true, walletId?: string, pass?: string) {
    this.wasmState$ = this.store.pipe(select(selectWasmState));
    this.wasmState$.subscribe((state) => {
        if (state) {
          this.wasmService.openWallet(pass);
        }
      });
      this.loginToWallet(pass);
  }

  startInterval() {
    this.refreshIntervalStatus = true;
    this.refreshIntervalId = setInterval(() => {
      this.walletDataUpdate();
    }, 5000);
  }

  stopInterval() {
    this.refreshIntervalStatus = false;
    clearInterval(this.refreshIntervalId);
  }

  loginToWallet(password: string) {
    this.store.dispatch(ChangeWalletState({walletState: true}));
    this.startInterval();
    this.loadWalletSettings();
    this.router.navigate([routes.WALLET_MAIN_ROUTE]);

    this.store.dispatch(saveError({errorValue:
      {
        gotAnError: false,
        errorMessage: ''
      }
    }));
  }

  private transactionsUpdate() {
    this.wasmService.wallet.sendRequest(JSON.stringify({
      jsonrpc: '2.0',
      id: rpcMethodIdsConsts.TX_LIST_ID,
      method: 'tx_list'
    }));
  }

  private utxoUpdate() {
    this.wasmService.wallet.sendRequest(JSON.stringify({
      jsonrpc: '2.0',
      id: rpcMethodIdsConsts.GET_UTXO_ID,
      method: 'get_utxo',
    }));
    this.transactionsUpdate();
  }

  addressesUpdate() {
    this.wasmService.wallet.sendRequest(JSON.stringify({
      jsonrpc: '2.0',
      id: rpcMethodIdsConsts.ADDR_LIST_ID,
      method: 'addr_list',
      params:
      {
        own: true
      }
    }));
    this.utxoUpdate();
  }

  walletDataUpdate() {
    this.wasmService.wallet.sendRequest(JSON.stringify({
      jsonrpc: '2.0',
      id: rpcMethodIdsConsts.WALLET_STATUS_ID,
      method: 'wallet_status'
    }));
    this.addressesUpdate();
  }

  transactionSend(sendData) {
    this.wasmService.wallet.sendRequest(JSON.stringify({
      jsonrpc: '2.0',
      id: rpcMethodIdsConsts.TX_SEND_ID,
      method: 'tx_send',
      params:
      {
        value : parseInt(sendData.amount.toFixed(), 10),
        fee : parseInt(sendData.fee.toFixed(), 10),
        address : sendData.address,
        comment : sendData.comment &&
          sendData.comment.length > 0 ?
          sendData.comment : ''
      }
    }));
  }

  changePassword(newPass, seedValue, idValue) {
    this.subManager.changePassSub = this.wasmService.wallet.subscribe((r)=> {
      const respone = JSON.parse(r);

      if (respone.id === rpcMethodIdsConsts.CHANGE_PASSWORD_ID) {
        this.logService.saveDataToLogs('[Wallet testnet: password changed]', respone);
        passworder.encrypt(newPass, {seed: seedValue, id: idValue}).then((result) => {
          this.saveWallet(result);
        });

        this.walletParams.pass = newPass;
        this.walletParams.seed = seedValue;
        this.walletParams.walletId = idValue;
      }
    });

    this.wasmService.wallet.sendRequest(JSON.stringify({
      jsonrpc: '2.0',
      id: rpcMethodIdsConsts.CHANGE_PASSWORD_ID,
      method: 'change_password',
      params:
      {
        new_pass: newPass,
      }
    }));
  }

  cancelTransaction(txId) {
    this.wasmService.wallet.sendRequest(JSON.stringify({
      jsonrpc: '2.0',
      id: rpcMethodIdsConsts.TX_CANCEL_ID,
      method: 'tx_cancel',
      params:
      {
        txId,
      }
    }));
  }

  deleteTransaction(txId) {
    this.wasmService.wallet.sendRequest(JSON.stringify({
      jsonrpc: '2.0',
      id: rpcMethodIdsConsts.TX_DELETE_ID,
      method: 'tx_delete',
      params:
      {
        txId,
      }
    }));
  }
}
