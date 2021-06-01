import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

declare const BeamModule: any;
import { Store, select } from '@ngrx/store';
import { 
  ChangeWasmState,
  updateWalletData } from '../store/actions/wallet.actions';
import * as extensionizer from 'extensionizer';
import {
  selectWalletSetting,
  selectVerificatedSetting
} from '../store/selectors/wallet-state.selectors';
import {
  loadAddresses,
  loadUtxo,
  loadTr,
  saveWalletStatus,
  isWalletLoadedState,
  updateVerificatedSetting } from '../store/actions/wallet.actions';
import { Router } from '@angular/router';
import { routes, globalConsts, rpcMethodIdsConsts } from '@consts';

@Injectable({providedIn: 'root'})
export class WasmService {
  private isWasmLoaded = false;
  private beamModule: any;
  wallet: any;
  module: any;
  keyKeeper: any;
  private options$: Observable<any>;
  private isMounted = false;
  private wasmReady = new BehaviorSubject<boolean>(false);

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
    });
  }

  public getSeedPhrase() {
    if (this.isWasmLoaded) {
      return this.module.GeneratePhrase();
    }
  }

  public isAllowedWord(word) {
    if (this.isWasmLoaded) {
      return this.module.IsAllowedWord(word);
    }
  }

  public isValidPhrase(phrase) {
    if (this.isWasmLoaded) {
      return this.module.IsValidPhrase(phrase);
    }
  }

  public deleteWalletDB() {
    let req = indexedDB.deleteDatabase('/beam_wallet');
    req.onsuccess = function () {
      console.log("Deleted database successfully");
    };
    req.onerror = function () {
      console.log("Couldn't delete database");
    };
    req.onblocked = (e) => {
      console.log("Couldn't delete database due to the operation being blocked");
    };  
  }

  public stopWallet() {
    if (this.wallet !== undefined) {
      this.wallet.stopWallet((data) => {
        console.log("is running: " + this.wallet.isRunning())
        console.log('wallet stopped:', data);
        this.deleteWalletDB();
      });
    }
  }

  private startWallet(pass: string) {
    this.wallet = new this.beamModule.WasmWalletClient("/beam_wallet/wallet.db", pass, "eu-node01.masternet.beam.mw:8200");
    console.log("starting wallet...");
    this.wallet.startWallet();
    this.store.dispatch(updateWalletData());
  }

  public createWallet(phrase: string, pass: string) {
    if (!this.isMounted) {
      this.module.MountFS(()=> {
        this.isMounted = true;
        console.log("mounted");
        this.module.CreateWallet(phrase, "/beam_wallet/wallet.db", pass);
        this.startWallet(pass);
        
        // this.wallet.setSyncHandler((done, total) => {
        //   console.log("sync [" + done + "/" + total + "]");
        // })
        var i = this.wallet.subscribe((r)=> {
          //console.log("response: " + r)
          const respone = JSON.parse(r);
          this.walletActions(respone);
        });
      });
    } else {
      this.module.CreateWallet(phrase, "/beam_wallet/wallet.db", pass);
      this.startWallet(pass);

      // this.wallet.setSyncHandler((done, total) => {
      //   console.log("sync [" + done + "/" + total + "]");
      // })
      var i = this.wallet.subscribe((r)=> {
        //console.log("response: " + r)
        const respone = JSON.parse(r);
        this.walletActions(respone);
      });
    }
  }

  public saveWalletOptions() {
    this.options$ = this.store.pipe(select(selectWalletSetting));
    this.options$.subscribe((state) => {
      extensionizer.storage.local.set({settings: state});
    }).unsubscribe();
  }

  public openWallet(pass) {
    this.module.MountFS(()=> {
      this.isMounted = true;
      console.log("mounted");
      this.startWallet(pass);

      this.wallet.subscribe((r)=> {
        const response = JSON.parse(r);
        this.walletActions(response);
      });
    });
  }


  private walletActions(response) {
    if (response.id === rpcMethodIdsConsts.ADDR_LIST_ID) {
      // console.log('[data-service] addresses: ');
      // console.dir(respone.result);
      //this.logService.saveDataToLogs('[Service testnet: addresses list]', msg);
      this.store.dispatch(loadAddresses({addresses: response.result.length > 0 ? response.result : []}));           
    } else if (response.id === rpcMethodIdsConsts.GET_UTXO_ID) {
      console.log('[data-service] utxo: ');
      console.dir(response.result);
      //this.logService.saveDataToLogs('[Service testnet: UTXO list]', respone);

      this.store.dispatch(loadUtxo({utxos: response.result.length > 0 ? response.result : []}));
    } else if (response.id === rpcMethodIdsConsts.TX_LIST_ID) {
      console.log('[data-service] transactions: ');
      console.dir(response.result);
      //this.logService.saveDataToLogs('[Service testnet: transaction list]', msg);

      this.store.dispatch(loadTr({transactions: response.result.length > 0 ? response.result : []}));
      this.store.dispatch(isWalletLoadedState({loadState: false}));
      console.log('----------update finished----------');
    } else if (response.id === rpcMethodIdsConsts.TX_SEND_ID) {
      console.log('send result: ', response);
      //this.logService.saveDataToLogs('[Wallet testnet: send finished]', msg);
      this.router.navigate([routes.WALLET_MAIN_ROUTE]);
    } else if (response.id === rpcMethodIdsConsts.TX_CANCEL_ID) {
        // this.logService.saveDataToLogs('[Wallet testnet: transaction cancelled]', txId);
      console.log('[Transaction cancelled]', response);
    } else if (response.id === rpcMethodIdsConsts.TX_DELETE_ID) {
      // this.logService.saveDataToLogs('[Wallet testnet: transaction deleted]', txId);
      console.log('[Transaction deleted]', response);
    } 
  }

  public keykeeperInit(seed) {
    return this.wasmReady.pipe(filter(value => value === true)).pipe(
      map(() => {
        this.keyKeeper = new this.module.KeyKeeper(seed);
      })
    );
  }
}
