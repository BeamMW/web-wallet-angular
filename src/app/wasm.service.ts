import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { WebsocketService } from './modules/websocket';

import * as Module from './../../wasm/wasm-key-keeper.js';
import '!!file-loader?name=wasm/wasm-key-keeper.wasm!../../wasm/wasm-key-keeper.wasm';

import { Store, select } from '@ngrx/store';
import { ChangeWasmState } from './store/actions/wallet.actions';

@Injectable({providedIn: 'root'})
export class WasmService {
  module: any;
  keyKeeper: any;

  wasmReady = new BehaviorSubject<boolean>(false);

  constructor(private store: Store<any>, private wsService: WebsocketService) {
  }

  init() {
    this.instantiateWasm('wasm/wasm-key-keeper.wasm').then(() => {
      this.store.dispatch(ChangeWasmState({wasmState: true}));
    });
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
      }
    };

    // instantiate the module
    this.module = Module(moduleArgs);
  }

  public keykeeperInit(seed) {
    return this.wasmReady.pipe(filter(value => value === true)).pipe(
      map(() => {
        // const wordList = new this.module.WordList();
        // seed.split(' ').forEach((word) => wordList.push_back(word));
        // const phrase = this.module.KeyKeeper.GeneratePhrase();

        // console.log(phrase);
        // return new this.module.KeyKeeper(phrase);
        return new this.module.KeyKeeper(seed);
      })
    );
  }

  private sendKeykeeperResult(id, result) {
    console.log(`>>> keykeeper result: ${result}`);
    this.wsService.send({
      jsonrpc: '2.0',
      id: id,
      result: JSON.parse(result)
    });
  }

  private sendKeykeeperError(id, error) {
    console.log(`>>> keykeeper error: ${error}`);
    this.wsService.send({
      jsonrpc: '2.0',
      id,
      error
    });
  }

  public generatePhrase() {
    return this.module.KeyKeeper.GeneratePhrase();
  }

  public onkeykeeper(data) {
    const handlers = {
      get_kdf: () => this.sendKeykeeperResult(data.id, this.keyKeeper.get_Kdf(data.params.root, data.params.child_key_num)), 
      get_slots: () => this.sendKeykeeperResult(data.id, this.keyKeeper.get_NumSlots()),
      create_output: () => this.sendKeykeeperResult(data.id, this.keyKeeper.CreateOutput(data.params.scheme, data.params.id)),
      sign_receiver: () => this.sendKeykeeperResult(data.id, this.keyKeeper.SignReceiver(data.params.inputs, data.params.outputs, data.params.kernel, data.params.non_conv, data.params.peer_id, data.params.my_id_key)),
      sign_sender: () => this.sendKeykeeperResult(data.id, this.keyKeeper.SignSender(data.params.inputs, data.params.outputs, data.params.kernel, data.params.non_conv, data.params.peer_id, data.params.my_id_key, data.params.slot, data.params.agreement, data.params.my_id)),
      sign_split: () => this.sendKeykeeperResult(data.id, this.keyKeeper.SignSplit(data.params.inputs, data.params.outputs, data.params.kernel, data.params.non_conv)),
    };
    handlers[data.method]
      ? handlers[data.method]()
      : this.sendKeykeeperError(data.id, `unknown method: ${data.method}`);
  }
}
