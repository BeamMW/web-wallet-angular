import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import * as Module from './../../wasm/wasm-key-keeper.js';
import '!!file-loader?name=wasm/wasm-key-keeper.wasm!../../wasm/wasm-key-keeper.wasm';

import { Store, select } from '@ngrx/store';
import { ChangeWasmState } from './store/actions/wallet.actions';

@Injectable({providedIn: 'root'})
export class WasmService {
  module: any;
  keyKeeper: any;

  wasmReady = new BehaviorSubject<boolean>(false);

  constructor(private store: Store<any>) {
  }

  init() {
    this.instantiateWasm('wasm/wasm-key-keeper.wasm');
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
    this.module = Module(moduleArgs);
  }

  public keykeeperInit(seed) {
    return this.wasmReady.pipe(filter(value => value === true)).pipe(
      map(() => {
        this.keyKeeper =  new this.module.KeyKeeper(seed);
      })
    );
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

  public getSendToken(sbbsAddressHex: string, identityStrHex: string, amountBase64: number) {
    return this.keyKeeper.getSendToken(sbbsAddressHex, identityStrHex, amountBase64);
  }
}
