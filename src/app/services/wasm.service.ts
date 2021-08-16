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
  private isWalletWasOpened = false;

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

  public createAppAPI(id, name, callback) {
    if (this.isWasmLoaded) {

      this.wallet.setApproveSendHandler((req, info, cb) => {
        console.log('APPROVE REQUEST: ', req);
        console.log('APPROVE INFO: ', info);
        if (window.confirm("Approve send?")) {
          cb.setApproved(req);
        } else {
          cb.setRejected(req);
        }
      });

      this.wallet.setApproveContractInfoHandler((req, info, amounts, cb) => {
        console.log('APPROVE CONTRACT REQUEST: ', req);
        console.log('APPROVE CONTRACT INFO: ', info);
        if (window.confirm("Approve contract?")) {
          cb.contractInfoApproved(req);
        } else {
          cb.contractInfoRejected(req);
        }
      });
      return this.wallet.createAppAPI(id, name, callback);
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
    this.module.DeleteWallet('/beam_wallet/wallet.db') 
  }

  public stopWallet() {
    if (this.wallet !== undefined) {
      setTimeout((wc)=>{
        this.wallet.stopWallet((data) => {
          console.log("is running: " + this.wallet.isRunning())
          console.log('wallet stopped:', data);
        });     
      }, 1000);
    }
  }

  public stopAndDelete() {
    if (this.wallet !== undefined) {
      this.wallet.stopWallet((data) => {
        console.log("is running: " + this.wallet.isRunning());
      });
    }
    this.deleteWalletDB();
  }

  private startWallet(pass: string) {
    if (this.wallet === undefined) {
      this.wallet = new this.beamModule.WasmWalletClient("/beam_wallet/wallet.db", pass, "eu-node01.masternet.beam.mw:8200");
      this.store.dispatch(updateWalletData());
    }
    console.log("starting wallet...");
    this.wallet.startWallet();
    
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
