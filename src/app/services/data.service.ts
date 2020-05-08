import { Injectable } from '@angular/core';
import * as ObservableStore from 'obs-store';
import { Subject, from, Subscription, Observable, Subscribable } from 'rxjs';
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
  saveContact } from '../store/actions/wallet.actions';
import { Router } from '@angular/router';
import { WasmService } from './../wasm.service';
import { LoginService } from './login.service';
import { WebsocketService } from './websocket.service';
import { routes } from '@consts';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  sendStore: any;
  options$: Observable<any>;
  appState$: Observable<any>;

  private loginProcessSub: Subscription;
  private openWalletSub: Subscription;
  private statusSub: Subscription;
  private addressesSub: Subscription;
  private utxoSub: Subscription;
  private trsSub: Subscription;

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
    private loginService: LoginService,
    private websocketService: WebsocketService,
    public router: Router,
    private wasmService: WasmService,
    private store: Store<any>) {
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
        currencySetting: {
          value: 0,
          updated: new Date().getTime()
        },
        dnsSetting: 'wallet-service.beam.mw',
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
      this.store.dispatch(updateCurrencySetting({settingValue: {
        value: settingsData.currencySetting.value,
        updated: settingsData.currencySetting.updated,
      }}));
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

  clearWalletData() {
    extensionizer.storage.local.remove(['settings', 'wallet', 'contacts', 'state']);
  }

  loginToService(seed: string, loginToWallet: boolean = true, walletId?: string, pass?: string) {
    this.wasmService.keykeeperInit(seed).subscribe(value => {
      if (!this.loginService.connected) {
        this.loginProcessSub = this.loginService.on().subscribe((msg: any) => {
          if (msg.result && msg.id === 123) {
            console.log('login_ws: OK, endpoint is ', msg.result.endpoint);
            const endpoint = ['ws://',  msg.result.endpoint].join('');
            this.websocketService.url = endpoint;
            this.websocketService.connect();
            if (loginToWallet) {
              this.loginToWallet(walletId, pass);
            }
          } else {
            console.log('login_ws: failed');
            if (msg.error) {
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
    });
  }

  loginToWallet(walletId: string, password: string) {
    this.openWalletSub = this.websocketService.on().subscribe((msg: any) => {
      if (msg.result && msg.id === 124 && msg.result.length) {
        console.log(`[login] wallet session: ${msg.result}`);
        if (this.openWalletSub) {
          this.openWalletSub.unsubscribe();
        }
        this.store.dispatch(ChangeWalletState({walletState: true}));
        this.walletDataUpdate();
        setInterval(() => {
          this.walletDataUpdate();
        }, 5000);
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
        this.store.dispatch(loadTr({transactions: msg.result.length !== undefined ? msg.result : [msg.result]}));
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
        this.store.dispatch(loadUtxo({utxos: msg.result.length ? msg.result : [msg.result]}));
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
        this.store.dispatch(loadAddresses({addresses: msg.result.length !== undefined ? msg.result : [msg.result]}));

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
}
