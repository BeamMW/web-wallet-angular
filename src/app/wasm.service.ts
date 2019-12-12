import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { WebsocketService } from './modules/websocket';

import * as Module from './../../wasm/wasm-key-keeper.js';
import '!!file-loader?name=wasm/wasm-key-keeper.wasm!../../wasm/wasm-key-keeper.wasm';

@Injectable({providedIn: 'root'})
export class WasmService {
  module: any;
  keyKeeper: any;

  wasmReady = new BehaviorSubject<boolean>(false);

  constructor(private wsService: WebsocketService) {
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
      }
    };

    // instantiate the module
    this.module = Module(moduleArgs);
  }

  public keykeeperInit(seed) {
    return this.wasmReady.pipe(filter(value => value === true)).pipe(
      map(() => {
        const wordList = new this.module.WordList();
        seed.split(' ').forEach((word) => wordList.push_back(word));
        return new this.module.KeyKeeper(wordList);
      })
    );
  }

  private sendKeykeeperResult(id, result) {
    console.log(`>>> keykeeper result: ${result}`);
    this.wsService.send({
      jsonrpc: '2.0',
      id,
      result
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

  public onkeykeeper(data) {
    const handlers = {
      generate_key:
        () => this.sendKeykeeperResult(data.id, this.keyKeeper.generatePublicKey(data.params.id, data.params.create_coin_key)),
      allocate_nonce_slot:
        () => this.sendKeykeeperResult(data.id, this.keyKeeper.allocateNonceSlot()),
      generate_output:
        () => this.sendKeykeeperResult(data.id, this.keyKeeper.generateOutput(data.params.scheme, data.params.id)),
      generate_nonce:
        () => this.sendKeykeeperResult(data.id, this.keyKeeper.generateNonce(data.params.slot)),
      sign:
        () => this.sendKeykeeperResult(data.id, this.keyKeeper.sign(data.params.inputs, data.params.outputs,
          data.params.offset, data.params.slot, data.params.kernel_parameters, data.params.public_nonce)),
    };
    handlers[data.method]
      ? handlers[data.method]()
      : this.sendKeykeeperError(data.id, `unknown method: ${data.method}`);
  }
}
