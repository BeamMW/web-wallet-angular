import { Injectable } from '@angular/core';
import { Subject, from, Subscription, Observable, Subscribable } from 'rxjs';
import * as extensionizer from 'extensionizer';
import { WalletState } from './../models/wallet-state.model';
import { Store, select } from '@ngrx/store';
import {
  selectAppState,
  selectWalletSetting,
  selectContacts,
  selectIsNeedToReconnect
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
  saveContact } from '../store/actions/wallet.actions';
import { Router } from '@angular/router';
import { WasmService } from './../wasm.service';
import { LoginService } from './login.service';
import { WebsocketService } from './websocket.service';
import { LogService } from './log.service';
import * as passworder from 'browser-passworder';
import { routes } from '@consts';
import * as ObservableStore from 'obs-store';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  options$: Observable<any>;
  appState$: Observable<any>;
  private needToReconnect$: Observable<any>;

  private loginProcessSub: Subscription;
  private openWalletSub: Subscription;
  private statusSub: Subscription;
  private addressesSub: Subscription;
  private utxoSub: Subscription;
  private trsSub: Subscription;
  private commonActionSub: Subscription;
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
          isMessageClosed: false
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
        isMessageClosed: settingsData.verificatedSetting.isMessageClosed
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
      isMessageClosed: false
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

  public disconnectWallet() {
    this.loginService.complete();
    this.websocketService.complete();
    this.websocketService.disconnect();
    this.loginService.disconnect();
  }

  public deactivateWallet() {
    this.disconnectWallet();
    this.store.dispatch(saveWallet({wallet: {}}));
    this.store.dispatch(ChangeWalletState({walletState: false}));
    clearInterval(this.refreshIntervalId);
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
    extensionizer.storage.local.remove(['settings', 'wallet', 'contacts', 'state']);
    clearInterval(this.refreshIntervalId);
  }

  loginToService(seed: string, loginToWallet: boolean = true, walletId?: string, pass?: string) {
    this.walletParams.pass = pass;
    this.walletParams.seed = seed;
    this.walletParams.walletId = loginToWallet ? walletId : this.loginService.loginParams.WalletID;

    // remove init from reconnect
    this.wasmService.keykeeperInit(seed).subscribe(value => {
      if (!this.loginService.connected) {
        this.loginProcessSub = this.loginService.on().subscribe((msg: any) => {
          if (msg.result && msg.id === 123) {
            console.log('login_ws: OK, endpoint is ', msg.result.endpoint);
            this.logService.saveDataToLogs('[Wallet: logged in with endpoint]', msg);
            const endpoint = ['wss://',  msg.result.endpoint].join('');
            this.websocketService.url = endpoint;
            this.websocketService.connect();
            if (loginToWallet) {
              this.loginToWallet(walletId, pass);
            }
          } else {
            this.logService.saveDataToLogs('[Wallet: Login failed]', '');
            if (msg.error) {
              this.logService.saveDataToLogs('[Wallet: Login error]', msg.error);
              console.log(`login_ws: error code:${msg.error.code} text:${msg.error.data}`)
            }
          }

          if (this.loginProcessSub) {
            this.loginProcessSub.unsubscribe();
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

  loginToWallet(walletId: string, password: string) {
    this.openWalletSub = this.websocketService.on().subscribe((msg: any) => {
      if (msg.result && msg.id === 124 && msg.result.length) {
        console.log(`[login] wallet session: ${msg.result}`);
        this.logService.saveDataToLogs('[Wallet: Opened]', msg);
        if (this.openWalletSub) {
          this.openWalletSub.unsubscribe();
        }
        this.store.dispatch(ChangeWalletState({walletState: true}));
        this.walletDataUpdate();
        this.refreshIntervalId = setInterval(() => {
          this.walletDataUpdate();
        }, 5000);
        this.loadWalletSettings();

        clearInterval(this.refreshReconnectIntervalId);
        this.store.dispatch(needToReconnect({isNeedValue: false}));

        this.router.navigate([routes.WALLET_MAIN_ROUTE]);
      }
    });

    this.websocketService.send({
      jsonrpc: '2.0',
      id: 124,
      method: 'open_wallet',
      params: {
        pass: password,
        id: walletId
      }
    });
  }

  private transactionsUpdate() {
    this.trsSub = this.websocketService.on().subscribe((msg: any) => {
      if (msg.result && msg.id === 6) {
        console.log('[data-service] transactions: ');
        console.dir(msg.result);
        this.logService.saveDataToLogs('[Service: transaction list]', msg);

        this.store.dispatch(loadTr({transactions: msg.result.length > 0 ? msg.result : []}));
        this.trsSub.unsubscribe();
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
    this.utxoSub = this.websocketService.on().subscribe((msg: any) => {
      if (msg.result && msg.id === 7) {
        console.log('[data-service] utxo: ');
        console.dir(msg.result);
        this.logService.saveDataToLogs('[Service: UTXO list]', msg);

        this.store.dispatch(loadUtxo({utxos: msg.result.length > 0 ? msg.result : []}));
        this.utxoSub.unsubscribe();
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
    this.addressesSub = this.websocketService.on().subscribe((msg: any) => {
      if (msg.result && msg.id === 8) {
        console.log('[data-service] addresses: ');
        console.dir(msg.result);
        this.logService.saveDataToLogs('[Service: addresses list]', msg);
        this.store.dispatch(loadAddresses({addresses: msg.result.length > 0 ? msg.result : []}));

        this.addressesSub.unsubscribe();
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
    this.statusSub = this.websocketService.on().subscribe((msg: any) => {
      if (msg.result && msg.id === 5) {
        console.log('[data-service] status: ');
        console.dir(msg);
        this.logService.saveDataToLogs('[Service: status]', msg);
        this.store.dispatch(saveWalletStatus({status: msg.result}));
        this.statusSub.unsubscribe();
        this.addressesUpdate();
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
    this.commonActionSub = this.websocketService.on().subscribe((msg: any) => {
      if (msg.result && msg.id === 125) {
        console.log('send result: ', msg);
        this.logService.saveDataToLogs('[Wallet: send finished]', msg);
        this.router.navigate([routes.WALLET_MAIN_ROUTE]);
        this.commonActionSub.unsubscribe();
      }
    });

    console.log('send init: ', sendData);
    this.logService.saveDataToLogs('[Wallet: send started]', sendData);

    this.websocketService.send({
      jsonrpc: '2.0',
      id: 125,
      method: 'tx_send',
      params:
      {
        value : sendData.amount,
        fee : sendData.fee,
        address : sendData.address,
        comment : sendData.comment &&
          sendData.comment.length > 0 ?
          sendData.comment : ''
      }
    });
  }

  changePassword(newPass, seedValue, idValue) {
    this.commonActionSub = this.websocketService.on().subscribe((msg: any) => {
      if (msg.id === 16) {
        this.commonActionSub.unsubscribe();
        this.logService.saveDataToLogs('[Wallet: password changed]', msg);
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
    this.commonActionSub = this.websocketService.on().subscribe((msg: any) => {
      if (msg.id === 15) {
        this.commonActionSub.unsubscribe();
        this.logService.saveDataToLogs('[Wallet: transaction cancelled]', txId);
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
    this.commonActionSub = this.websocketService.on().subscribe((msg: any) => {
      if (msg.id === 18) {
        this.commonActionSub.unsubscribe();
        this.logService.saveDataToLogs('[Wallet: transaction deleted]', txId);
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

  calculateTrChange(amountValue) {
    this.commonActionSub = this.websocketService.on().subscribe((msg: any) => {
      if (msg.id === 17) {
        this.commonActionSub.unsubscribe();
        this.store.dispatch(saveSendData({send: {change: msg.result.change}}));
        this.logService.saveDataToLogs('[Wallet: change calculation]', msg.result);
      }
    });
    this.websocketService.send({
        jsonrpc: '2.0',
        id: 17,
        method: 'calc_change',
        params:
        {
          amount: amountValue,
        }
    });
  }
}
