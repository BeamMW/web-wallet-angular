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
  selectWalletSetting
} from '../store/selectors/wallet-state.selectors';
import { Router } from '@angular/router';

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
        //this.deleteWalletDB();
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
      });
    } else {
      this.module.CreateWallet(phrase, "/beam_wallet/wallet.db", pass);
      this.startWallet(pass);

      // this.wallet.setSyncHandler((done, total) => {
      //   console.log("sync [" + done + "/" + total + "]");
      // })
    }
  }

  public saveWalletOptions() {
    this.options$ = this.store.pipe(select(selectWalletSetting));
    this.options$.subscribe((state) => {
      extensionizer.storage.local.set({settings: state});
    }).unsubscribe();
  }

  public openWallet(pass) {
    if (this.isMounted) {
      this.startWallet(pass);
    } else {
      this.module.MountFS(()=> {
        this.isMounted = true;
        console.log("mounted");
        this.startWallet(pass);
      });
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
