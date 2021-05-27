import { Injectable } from '@angular/core';
import { Subject, from, Subscription, Observable, Subscribable } from 'rxjs';
import * as extensionizer from 'extensionizer';
import { 
  WalletState,
  AssetMetadata
} from '@app/models';
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
import {
  assetPropertiesConsts,
  rpcMethodIdsConsts 
} from '@consts';
import * as ObservableStore from 'obs-store';
import { Asset, AssetInfo } from '@app/models';

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

  public isAssetsInfoLoading = true;
  public assetsCount = 0;
  public assetsReqCount = 0;
  public assetsInfoTmp: AssetInfo[] = [];

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

    // this.needToReconnect$ = this.store.pipe(select(selectIsNeedToReconnect));
    // this.needToReconnect$.subscribe((state) => {
    //   if (state) {
    //     this.refreshReconnectIntervalId = setInterval(() => {
    //       //this.disconnectWallet();
    //       //clearInterval(this.refreshIntervalId);
    //       //this.loginToService(this.walletParams.seed, true, this.walletParams.walletId, this.walletParams.pass);
    //       console.log('[reconnecting...]');
    //       this.logService.saveDataToLogs('[Wallet testnet: reconnecting triggered]', '');
    //     }, 10000);
    //   }
    // });
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
          this.logService.saveDataToLogs('[Wallet: Activated]', walletData);
          this.store.dispatch(saveWallet({wallet: walletData}));
          this.store.dispatch(ChangeWalletState({walletState: true}));
      }
    });
  }

  public deactivateWallet() {
    clearInterval(this.refreshIntervalId);
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
    this.wasmService.stopWallet();
    extensionizer.storage.local.remove(['settings', 'wallet', 'contacts', 'state']);
  }

  startInterval() {
    this.refreshIntervalStatus = true;
    this.refreshIntervalId = setInterval(() => {
      this.walletDataUpdate();
    }, 8000);
  }

  stopInterval() {
    this.refreshIntervalStatus = false;
    clearInterval(this.refreshIntervalId);
  }

  loginToWallet(password: string) {
    this.wasmService.openWallet(password);
    this.startWallet();
  }

  startWallet() {
    this.store.dispatch(ChangeWalletState({walletState: true}));
    this.startInterval();
    this.loadWalletSettings();

    this.store.dispatch(saveError({
      errorValue: {
        gotAnError: false,
        errorMessage: ''
      }
    }));
  }

  private transactionsUpdate() {
    this.wasmService.wallet.sendRequest(JSON.stringify({
      jsonrpc: '2.0',
      id: rpcMethodIdsConsts.TX_LIST_ID,
      method: 'tx_list',
      params: {
        assets: true
      }
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

  public async validateAddress(address: string) {
    this.wasmService.wallet.sendRequest(JSON.stringify({
      jsonrpc: '2.0',
      id: rpcMethodIdsConsts.VALIDATE_ADDRESS,
      method: rpcMethodIdsConsts.VALIDATE_ADDRESS,
      params: {
        address: address
      }
    }));
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
      method: rpcMethodIdsConsts.WALLET_STATUS_ID,
      params: {
        assets: true
      }
    }));
    this.addressesUpdate();
  }

  loadAssetsInfo(assets: Asset[]) {
    for (let asset of assets) {
      if (asset.asset_id > 0) {
        this.wasmService.wallet.sendRequest(JSON.stringify({
          jsonrpc: '2.0',
          id: rpcMethodIdsConsts.GET_ASSET_INFO,
          method: rpcMethodIdsConsts.GET_ASSET_INFO,
          params: {
            assets: true,
            asset_id: asset.asset_id
          }
        }));
      }
    }
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
          sendData.comment : '',
        asset_id: sendData.asset_id,
        offline: sendData.offline
      }
    }));
  }

  public calcChange(amount: number, is_push_transaction: boolean, asset_id: number) {
    this.wasmService.wallet.sendRequest(JSON.stringify({
      jsonrpc: '2.0',
      id: rpcMethodIdsConsts.CALC_CHANGE_ID,
      method: rpcMethodIdsConsts.CALC_CHANGE_ID,
      params: {
        amount,
        is_push_transaction,
        asset_id
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



  public getAssetMetadata(data: string) {
    let metadata: AssetMetadata = {
      asset_name: '',
      short_name: '',
      unit_name: '',
      smallest_unit_name: ''
    };
    
    let propIndex = data.indexOf(assetPropertiesConsts.ASSET_NAME);
    metadata.asset_name = data.slice(propIndex + assetPropertiesConsts.ASSET_NAME.length, 
      data.indexOf(';', propIndex) > 0 ? data.indexOf(';', propIndex) : data.length);

    propIndex = data.indexOf(assetPropertiesConsts.SHORT_NAME);
    metadata.short_name = data.slice(propIndex + assetPropertiesConsts.SHORT_NAME.length,
      data.indexOf(';', propIndex) > 0 ? data.indexOf(';', propIndex) : data.length);

    propIndex = data.indexOf(assetPropertiesConsts.UNIT_NAME);
    metadata.unit_name = data.slice(propIndex + assetPropertiesConsts.UNIT_NAME.length,
      data.indexOf(';', propIndex) > 0 ? data.indexOf(';', propIndex) : data.length);

    propIndex = data.indexOf(assetPropertiesConsts.SMALLET_UNIT_NAME);
    metadata.smallest_unit_name = data.slice(propIndex + assetPropertiesConsts.SMALLET_UNIT_NAME.length,
      data.indexOf(';', propIndex) > 0 ? data.indexOf(';', propIndex) : data.length);

    propIndex = data.indexOf(assetPropertiesConsts.RATIO);
    if (propIndex > 0) {
      metadata.ratio = parseInt(data.slice(propIndex + assetPropertiesConsts.RATIO.length,
        data.indexOf(';', propIndex) > 0 ? data.indexOf(';', propIndex) : data.length));
    }

    propIndex = data.indexOf(assetPropertiesConsts.SHORT_DESC);
    if (propIndex > 0) {
      metadata.short_desc = data.slice(propIndex + assetPropertiesConsts.SHORT_DESC.length,
        data.indexOf(';', propIndex) > 0 ? data.indexOf(';', propIndex) : data.length);
    }

    propIndex = data.indexOf(assetPropertiesConsts.LONG_DESC);
    if (propIndex > 0) {
      metadata.long_desc = data.slice(propIndex + assetPropertiesConsts.LONG_DESC.length,
        data.indexOf(';', propIndex) > 0 ? data.indexOf(';', propIndex) : data.length);
    }

    propIndex = data.indexOf(assetPropertiesConsts.SITE_URL);
    if (propIndex > 0) {
      metadata.site_url = data.slice(propIndex + assetPropertiesConsts.SITE_URL.length,
        data.indexOf(';', propIndex) > 0 ? data.indexOf(';', propIndex) : data.length);
    }

    propIndex = data.indexOf(assetPropertiesConsts.PDF_URL);
    if (propIndex > 0) {
      metadata.pdf_url = data.slice(propIndex + assetPropertiesConsts.PDF_URL.length,
        data.indexOf(';', propIndex) > 0 ? data.indexOf(';', propIndex) : data.length);
    }

    propIndex = data.indexOf(assetPropertiesConsts.FAVICON_URL);
    if (propIndex > 0) {
      metadata.favicon_url = data.slice(propIndex + assetPropertiesConsts.FAVICON_URL.length,
        data.indexOf(';', propIndex) > 0 ? data.indexOf(';', propIndex) : data.length);
    }

    propIndex = data.indexOf(assetPropertiesConsts.LOGO_URL);
    if (propIndex > 0) {
      metadata.logo_url = data.slice(propIndex + assetPropertiesConsts.LOGO_URL.length,
        data.indexOf(';', propIndex) > 0 ? data.indexOf(';', propIndex) : data.length);
    }

    propIndex = data.indexOf(assetPropertiesConsts.COLOR);
    if (propIndex > 0) {
      metadata.color = data.slice(propIndex + assetPropertiesConsts.COLOR.length,
        data.indexOf(';', propIndex) > 0 ? data.indexOf(';', propIndex) : data.length);
    }

    return metadata;
  }
}
