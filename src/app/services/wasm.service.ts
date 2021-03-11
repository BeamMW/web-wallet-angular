import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

//import * as BeamModule from '../wasm/wasm-client.js';
declare const BeamModule: any;
import { Store, select } from '@ngrx/store';
import { ChangeWasmState } from '../store/actions/wallet.actions';


import { Subject, from, Subscription, Subscribable } from 'rxjs';
import * as extensionizer from 'extensionizer';
import { WalletState } from '../models/wallet-state.model';
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
import { LoginService } from './login.service';
import { WebsocketService } from './websocket.service';
import { LogService } from './log.service';
import * as passworder from 'browser-passworder';
import { routes, globalConsts, rpcMethodIdsConsts } from '@consts';
import * as ObservableStore from 'obs-store';


import { selectWasmState } from '../store/selectors/wallet-state.selectors';

@Injectable({providedIn: 'root'})
export class WasmService {
  isWasmLoaded = false;
  beamModule: any;
  wallet: any;
  module: any;
  keyKeeper: any;
  options$: Observable<any>;

  wasmReady = new BehaviorSubject<boolean>(false);

  constructor(
    public router: Router,
    private store: Store<any>) {
  }

  init() {
    BeamModule().then((Module) => {
      this.beamModule = Module;
      this.module = Module.WasmWalletClient;
      this.isWasmLoaded = true;
      this.store.dispatch(ChangeWasmState({wasmState: true}));

      /*
      
      
      Module.WasmWalletClient.MountFS(()=> {
              console.log("mounted");
              //Module.WasmWalletClient.CreateWallet(phrase, "/beam_wallet/wallet.db", "123");
              this.module = new Module.WasmWalletClient("/beam_wallet/wallet.db", "123", "127.0.0.1:8101")//"eu-node03.masternet.beam.mw:8100");
              console.log("starting wallet...");
      this.module.startWallet();
      var i = this.module.subscribe((r)=> {
          console.log("response: " + r)
      });
      this.module.sendRequest(JSON.stringify({
            jsonrpc: '2.0',
            id: 5,
            method: 'wallet_status'
          }));

      this.module.unsubscribe(i)    
      this.module.sendRequest(JSON.stringify({
            jsonrpc: '2.0',
            id: 5,
            method: 'wallet_status'
          }));
          
              });
      
      });
      */
    //this.instantiateWasm('wasm/wasm-client.wasm');
    });
  }

  public getSeedPhrase() {
    if (this.isWasmLoaded) {
      const phrase = this.module.GeneratePhrase();
      console.log('seed phrase is: ', phrase);
      console.log("IsAllowedWord('hurdle') -", this.module.IsAllowedWord('hurdle'))
      console.log("IsValidPhrase()", this.module.IsValidPhrase(phrase))
      console.log('world list size is', phrase.split(' ').length)
      return phrase;
    }
  }

  public createWallet(phrase, pass) {
    this.module.MountFS(()=> {
      console.log("mounted");
      this.module.CreateWallet(phrase, "/beam_wallet/wallet.db", pass);
      this.wallet = new this.beamModule.WasmWalletClient("/beam_wallet/wallet.db", pass, "eu-node01.masternet.beam.mw:8200")//"eu-node03.masternet.beam.mw:8100");
      console.log("starting wallet...");
      this.wallet.startWallet();
      var i = this.wallet.subscribe((r)=> {
        console.log("response: " + r)
        const respone = JSON.parse(r);
        this.walletActions(respone);
      });
    });
  }

  public saveWalletOptions() {
    this.options$ = this.store.pipe(select(selectWalletSetting));
    this.options$.subscribe((state) => {
      extensionizer.storage.local.set({settings: state});
    }).unsubscribe();
  }

  public openWallet(pass) {
    this.module.MountFS(()=> {
      console.log("mounted");
      this.wallet = new this.beamModule.WasmWalletClient("/beam_wallet/wallet.db", pass, "eu-node01.masternet.beam.mw:8200")//"eu-node03.masternet.beam.mw:8100");
      console.log("starting wallet...");
      this.wallet.startWallet();
      var i = this.wallet.subscribe((r)=> {
        console.log("response: " + r)

        const respone = JSON.parse(r);
        this.walletActions(respone);
      });
    });
  }


  private walletActions(respone) {
    if (respone.id === rpcMethodIdsConsts.WALLET_STATUS_ID) {
      //this.subManager.statusSub.unsubscribe();
      this.store.dispatch(saveWalletStatus({status: respone.result}));

      if (respone.result.receiving > 0 || respone.result.available > 0) {
        const verificatedSetting$ = this.store.pipe(select(selectVerificatedSetting));
        verificatedSetting$.subscribe((verState) => {
          if (!verState.balanceWasPositive && (respone.result.receiving > 0 || respone.result.available > 0)) {
            this.store.dispatch(updateVerificatedSetting({settingValue: {
              state: verState.state,
              isMessageClosed: verState.isMessageClosed,
              balanceWasPositive: true,
              balanceWasPositiveMoreEn: verState.balanceWasPositiveMoreEn
            }}));
            this.saveWalletOptions();
          }

          if (!verState.balanceWasPositiveMoreEn && (respone.result.receiving >= 100 * globalConsts.GROTHS_IN_BEAM ||
            respone.result.available >= 100 * globalConsts.GROTHS_IN_BEAM)) {
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

    if (respone.id === rpcMethodIdsConsts.ADDR_LIST_ID) {
      //this.subManager.addressesSub.unsubscribe();
      console.log('[data-service] addresses: ');
      console.dir(respone.result);
      //this.logService.saveDataToLogs('[Service testnet: addresses list]', msg);
      this.store.dispatch(loadAddresses({addresses: respone.result.length > 0 ? respone.result : []}));           
    }

    if (respone.id === rpcMethodIdsConsts.GET_UTXO_ID) {
      //this.subManager.utxoSub.unsubscribe();
      console.log('[data-service] utxo: ');
      console.dir(respone.result);
      //this.logService.saveDataToLogs('[Service testnet: UTXO list]', respone);

      this.store.dispatch(loadUtxo({utxos: respone.result.length > 0 ? respone.result : []}));
    }

    if (respone.id === rpcMethodIdsConsts.TX_LIST_ID) {
      //this.subManager.trsSub.unsubscribe();
      console.log('[data-service] transactions: ');
      console.dir(respone.result);
      //this.logService.saveDataToLogs('[Service testnet: transaction list]', msg);

      this.store.dispatch(loadTr({transactions: respone.result.length > 0 ? respone.result : []}));
      console.log('----------update finished----------');
    }

    if (respone.id === rpcMethodIdsConsts.TX_SEND_ID) {
      console.log('send result: ', respone);
      //this.logService.saveDataToLogs('[Wallet testnet: send finished]', msg);
      this.router.navigate([routes.WALLET_MAIN_ROUTE]);
    }

    if (respone.id === rpcMethodIdsConsts.TX_CANCEL_ID) {
        // this.subManager.txCancelSub.unsubscribe();
        // this.logService.saveDataToLogs('[Wallet testnet: transaction cancelled]', txId);

      console.log('[Transaction cancelled]', respone);
    }

    if (respone.id === rpcMethodIdsConsts.TX_DELETE_ID) {
      // this.subManager.txDeleteSub.unsubscribe();
      // this.logService.saveDataToLogs('[Wallet testnet: transaction deleted]', txId);
      console.log('[Transaction deleted]', respone);
    }
  }

  private async instantiateWasm(url: string) {
    // fetch the wasm file
    const wasmFile = await fetch(url);

    // convert it into a binary array
    const buffer = await wasmFile.arrayBuffer();
    const binary = new Uint8Array(buffer);

    // create module arguments
    // including the wasm-file
    const moduleArgs = {
      wasmBinary: binary,
      onRuntimeInitialized: () => {
        this.wasmReady.next(true);
        this.store.dispatch(ChangeWasmState({wasmState: true}));
      }
    };

    // instantiate the module
    this.module = BeamModule(moduleArgs);
  }

  public keykeeperInit(seed) {
    return this.wasmReady.pipe(filter(value => value === true)).pipe(
      map(() => {
        this.keyKeeper = new this.module.KeyKeeper(seed);
      })
    );
  }

  public isAllowedWord(word: string) {
    return this.module.KeyKeeper.IsAllowedWord(word);
  }

  public isValidPhrase(phrase: string) {
    return this.module.KeyKeeper.IsValidPhrase(phrase);
  }

  public generatePhrase() {
    return this.module.KeyKeeper.GeneratePhrase();
  }

  public getWalletID() {
    return this.keyKeeper.getWalletID();
  }

  public getSbbsAddress(identityStrHex: string) {
    return this.keyKeeper.getSbbsAddress(identityStrHex);
  }

  public getSbbsAddressPrivate(identityStrHex: string) {
    return this.keyKeeper.getSbbsAddressPrivate(identityStrHex);
  }

  public getIdentity(keyIDBase64: string) {
    return this.keyKeeper.getIdentity(keyIDBase64);
  }

  public getSendToken(sbbsAddressHex: string, identityStrHex: string, amountBase64: string) {
    return this.keyKeeper.getSendToken(sbbsAddressHex, identityStrHex, amountBase64);
  }

  public convertTokenToJson(token: string) {
    return this.module.KeyKeeper.ConvertTokenToJson(token);
  }

  // AzR7uDU8tfDoD89W7eFLdwYNFVeqeX4PNV6LSUBq1y59jYFG7ng8KcTFA7w1Jq6kiAQEccqCvmJvDiRTMmtcEwZM5BXvDhBgDXPiUbzWm18Ru2hCSXJXFJS8dv95XP9USj
}
