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
import { WasmService } from './../wasm.service';
import { LoginService } from './login.service';
import { WebsocketService } from './websocket.service';
import { LogService } from './log.service';
import * as passworder from 'browser-passworder';
import { routes, globalConsts } from '@consts';
import * as ObservableStore from 'obs-store';

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
    private loginService: LoginService,
    private websocketService: WebsocketService,
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
    this.loginService.complete();
    this.websocketService.complete();
    this.websocketService.disconnect();
    this.loginService.disconnect();
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
    extensionizer.storage.local.remove(['settings', 'wallet', 'contacts', 'state']);
  }

  loginToService(seed: string, loginToWallet: boolean = true, walletId?: string, pass?: string) {
    if (pass !== undefined && this.walletParams.pass.length === 0 &&
        this.walletParams.seed.length === 0 &&
        walletId !== undefined && this.walletParams.walletId.length === 0) {
      this.walletParams.pass = pass;
      this.walletParams.seed = seed;
      this.walletParams.walletId = loginToWallet ? walletId : this.loginService.loginParams.WalletID;
    }

    // remove init from reconnect
    this.wasmService.keykeeperInit(seed).subscribe(value => {
      if (!this.loginService.connected) {
        this.subManager.loginProcessSub = this.loginService.on().subscribe((msg: any) => {
          if (msg.result && msg.id === 123) {
            clearInterval(this.refreshReconnectIntervalId);
            this.store.dispatch(needToReconnect({isNeedValue: false}));
            this.subManager.loginProcessSub.unsubscribe();
            console.log('login_ws: OK, endpoint is ', msg.result.endpoint);
            this.logService.saveDataToLogs('[Wallet testnet: logged in with endpoint]', msg);
            const endpoint = ['wss://',  msg.result.endpoint].join('');
            this.websocketService.url = endpoint;
            this.websocketService.connect();
            if (loginToWallet) {
              this.loginToWallet(walletId, pass);
            }
          } else {
            this.logService.saveDataToLogs('[Wallet testnet: Login failed]', '');
            if (msg.error) {
              this.logService.saveDataToLogs('[Wallet testnet: Login error]', msg.error);
              console.log(`login_ws: error code:${msg.error.code} text:${msg.error.data}`)
            }
          }
        });

        this.loginService.init();
        this.loginService.connect();
        this.loginService.send({
            jsonrpc: '2.0',
            id: 123,
            method: 'login',
            params: this.loginService.loginParams
        });
      } else if (loginToWallet) {
        this.loginToWallet(walletId, pass);
      }
    }).unsubscribe();
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

  loginToWallet(walletId: string, password: string) {
    this.subManager.openWalletSub = this.websocketService.on().subscribe((msg: any) => {
      if (msg.result && msg.id === 124 && msg.result.length) {
        this.subManager.openWalletSub.unsubscribe();

        console.log(`[login] wallet session: ${msg.result}`);
        this.logService.saveDataToLogs('[Wallet testnet: Opened]', msg);
        this.store.dispatch(ChangeWalletState({walletState: true}));
        this.walletDataUpdate();
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

      if (msg.error !== undefined && msg.id === 124) {
        this.subManager.openWalletSub.unsubscribe();

        if (msg.error.code === -32013) {
          this.store.dispatch(saveError({errorValue:
            {
              gotAnError: true,
              errorMessage: 'Database not found'
            }
          }));
        } else if (msg.error.code === -32012) {
          this.store.dispatch(saveError({errorValue:
            {
              gotAnError: true,
              errorMessage: 'Database error'
            }
          }));
        } else if (msg.error.code === -32600) {
          this.store.dispatch(saveError({errorValue:
            {
              gotAnError: true,
              errorMessage: 'Parse error'
            }
          }));
        } else if (msg.error.code === -32603) {
          this.store.dispatch(saveError({errorValue:
            {
              gotAnError: true,
              errorMessage: 'Generic internal error'
            }
          }));
        }
      }
    });

    this.websocketService.send({
      jsonrpc: '2.0',
      id: 124,
      method: 'open_wallet',
      params: {
        pass: password,
        id: walletId,
        fresh_keeper: true
      }
    });
  }

  private transactionsUpdate() {
    this.subManager.trsSub = this.websocketService.on().subscribe((msg: any) => {
      if (msg.result && msg.id === 6) {
        this.subManager.trsSub.unsubscribe();
        console.log('[data-service] transactions: ');
        console.dir(msg.result);
        this.logService.saveDataToLogs('[Service testnet: transaction list]', msg);

        this.store.dispatch(loadTr({transactions: msg.result.length > 0 ? msg.result : []}));
        console.log('----------update finished----------');
      }
    });
    this.websocketService.send({
      jsonrpc: '2.0',
      id: 6,
      method: 'tx_list'
    });
  }

  private utxoUpdate() {
    this.subManager.utxoSub = this.websocketService.on().subscribe((msg: any) => {
      if (msg.result && msg.id === 7) {
        this.subManager.utxoSub.unsubscribe();
        console.log('[data-service] utxo: ');
        console.dir(msg.result);
        this.logService.saveDataToLogs('[Service testnet: UTXO list]', msg);

        this.store.dispatch(loadUtxo({utxos: msg.result.length > 0 ? msg.result : []}));
        this.transactionsUpdate();
      }
    });
    this.websocketService.send({
      jsonrpc: '2.0',
      id: 7,
      method: 'get_utxo'
    });
  }

  addressesUpdate() {
    this.subManager.addressesSub = this.websocketService.on().subscribe((msg: any) => {
      if (msg.result && msg.id === 8) {
        this.subManager.addressesSub.unsubscribe();
        console.log('[data-service] addresses: ');
        console.dir(msg.result);
        this.logService.saveDataToLogs('[Service testnet: addresses list]', msg);
        this.store.dispatch(loadAddresses({addresses: msg.result.length > 0 ? msg.result : []}));

        this.utxoUpdate();
      }
    });
    this.websocketService.send({
      jsonrpc: '2.0',
      id: 8,
      method: 'addr_list',
      params:
      {
        own: true
      }
    });
  }

  walletDataUpdate() {
    this.subManager.statusSub = this.websocketService.on().subscribe((msg: any) => {
      if (msg.result && msg.id === 5) {
        this.subManager.statusSub.unsubscribe();

        console.log('[data-service] status: ');
        console.dir(msg);
        this.logService.saveDataToLogs('[Service testnet: status]', msg);
        this.store.dispatch(saveWalletStatus({status: msg.result}));
        this.addressesUpdate();

        if (msg.result.receiving > 0 || msg.result.available > 0) {
          const verificatedSetting$ = this.store.pipe(select(selectVerificatedSetting));
          verificatedSetting$.subscribe((verState) => {
            if (!verState.balanceWasPositive && (msg.result.receiving > 0 || msg.result.available > 0)) {
              this.store.dispatch(updateVerificatedSetting({settingValue: {
                state: verState.state,
                isMessageClosed: verState.isMessageClosed,
                balanceWasPositive: true,
                balanceWasPositiveMoreEn: verState.balanceWasPositiveMoreEn
              }}));
              this.saveWalletOptions();
            }

            if (!verState.balanceWasPositiveMoreEn && (msg.result.receiving >= 100 * globalConsts.GROTHS_IN_BEAM ||
                msg.result.available >= 100 * globalConsts.GROTHS_IN_BEAM)) {
              this.store.dispatch(updateVerificatedSetting({settingValue: {
                state: verState.state,
                isMessageClosed: verState.isMessageClosed,
                balanceWasPositive: verState.balanceWasPositive,
                balanceWasPositiveMoreEn: true
              }}));
              this.saveWalletOptions();
            }
          }).unsubscribe();
        }
      }
    });

    console.log('----------update started----------');
    this.websocketService.send({
      jsonrpc: '2.0',
      id: 5,
      method: 'wallet_status'
    });
  }

  transactionSend(sendData) {
    this.subManager.sendTrSub = this.websocketService.on().subscribe((msg: any) => {
      if (msg.result && msg.id === 125) {
        this.subManager.sendTrSub.unsubscribe();
        console.log('send result: ', msg);
        this.logService.saveDataToLogs('[Wallet testnet: send finished]', msg);
        this.router.navigate([routes.WALLET_MAIN_ROUTE]);
      }
    });

    console.log('send init: ', sendData);
    this.logService.saveDataToLogs('[Wallet testnet: send started]', sendData);

    this.websocketService.send({
      jsonrpc: '2.0',
      id: 125,
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
    });
  }

  changePassword(newPass, seedValue, idValue) {
    this.subManager.changePassSub = this.websocketService.on().subscribe((msg: any) => {
      if (msg.id === 16) {
        this.subManager.changePassSub.unsubscribe();
        this.logService.saveDataToLogs('[Wallet testnet: password changed]', msg);
        passworder.encrypt(newPass, {seed: seedValue, id: idValue}).then((result) => {
          this.saveWallet(result);
        });

        this.walletParams.pass = newPass;
        this.walletParams.seed = seedValue;
        this.walletParams.walletId = idValue;
      }
    });
    this.websocketService.send({
        jsonrpc: '2.0',
        id: 16,
        method: 'change_password',
        params:
        {
          new_pass: newPass,
        }
    });
  }

  cancelTransaction(txId) {
    this.subManager.txCancelSub = this.websocketService.on().subscribe((msg: any) => {
      if (msg.id === 15) {
        this.subManager.txCancelSub.unsubscribe();
        this.logService.saveDataToLogs('[Wallet testnet: transaction cancelled]', txId);
      }
    });
    this.websocketService.send({
        jsonrpc: '2.0',
        id: 15,
        method: 'tx_cancel',
        params:
        {
          txId,
        }
    });
  }

  deleteTransaction(txId) {
    this.subManager.txDeleteSub = this.websocketService.on().subscribe((msg: any) => {
      if (msg.id === 18) {
        this.subManager.txDeleteSub.unsubscribe();
        this.logService.saveDataToLogs('[Wallet testnet: transaction deleted]', txId);
      }
    });
    this.websocketService.send({
        jsonrpc: '2.0',
        id: 18,
        method: 'tx_delete',
        params:
        {
          txId,
        }
    });
  }
}
