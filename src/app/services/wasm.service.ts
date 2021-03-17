import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

declare const BeamModule: any;
import { Store, select } from '@ngrx/store';
import { ChangeWasmState } from '../store/actions/wallet.actions';
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
  updateVerificatedSetting } from '../store/actions/wallet.actions';
import { Router } from '@angular/router';
import { routes, globalConsts, rpcMethodIdsConsts } from '@consts';

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
    indexedDB.deleteDatabase('/beam_wallet');
  }

  public createWallet(phrase, pass) {
    this.module.MountFS(()=> {
      console.log("mounted");
      this.module.CreateWallet(phrase, "/beam_wallet/wallet.db", pass);
      this.wallet = new this.beamModule.WasmWalletClient("/beam_wallet/wallet.db", pass, "eu-node01.masternet.beam.mw:8200");
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
      console.log('[data-service] addresses: ');
      console.dir(respone.result);
      //this.logService.saveDataToLogs('[Service testnet: addresses list]', msg);
      this.store.dispatch(loadAddresses({addresses: respone.result.length > 0 ? respone.result : []}));           
    }

    if (respone.id === rpcMethodIdsConsts.GET_UTXO_ID) {
      console.log('[data-service] utxo: ');
      console.dir(respone.result);
      //this.logService.saveDataToLogs('[Service testnet: UTXO list]', respone);

      this.store.dispatch(loadUtxo({utxos: respone.result.length > 0 ? respone.result : []}));
    }

    if (respone.id === rpcMethodIdsConsts.TX_LIST_ID) {
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
        // this.logService.saveDataToLogs('[Wallet testnet: transaction cancelled]', txId);
      console.log('[Transaction cancelled]', respone);
    }

    if (respone.id === rpcMethodIdsConsts.TX_DELETE_ID) {
      // this.logService.saveDataToLogs('[Wallet testnet: transaction deleted]', txId);
      console.log('[Transaction deleted]', respone);
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
