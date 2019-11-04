import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import { filter, map } from "rxjs/operators";

import * as Module from './../../wasm/wasm-key-keeper.js';
import "!!file-loader?name=wasm/wasm-key-keeper.wasm!../../wasm/wasm-key-keeper.wasm";

@Injectable({providedIn: 'root'})
export class WasmService {
  module: any;

  wasmReady = new BehaviorSubject<boolean>(false);

  constructor() {
    this.instantiateWasm("wasm/wasm-key-keeper.wasm");
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

  public keyKeeper(): Observable<number> {
    return this.wasmReady.pipe(filter(value => value === true)).pipe(
      map(() => {
        const wordList = new this.module.WordList();
        ['copy', 'vendor', 'shallow', 'raven', 'coffee',
        'appear', 'book', 'blast', 'lock', 'exchange',
        'farm', 'glue'].forEach((word) => wordList.push_back(word));
        const keykeeper = new this.module.KeyKeeper(wordList);
        const pk = keykeeper.generatePublicKey("j25vcm2HA5SIAQ==", true);
        console.log('public key is: data:application/octet-stream;base64,' + pk)
        console.log('ownerKey is: data:application/octet-stream;base64,' + keykeeper.getOwnerKey('123'));
        const slot = keykeeper.allocateNonceSlot();
        console.log('allocated nonce slot: ' + slot);
        const nonce = keykeeper.generateNonce(slot);
        console.log('generated nonce: data:application/octet-stream;base64,' + nonce);
        const output = keykeeper.generateOutput('A5SIAQ==', 'j25vcm2HA5SIAQ==');
        console.log('output is: data:application/octet-stream;base64,' + output)
        const sign = keykeeper.sign("gYBub3JtBAAAAAGo", 
            "goBub3JtBAAAAAGQgG5vcm0EAAAAAZg=", 
            "n4IJkOJI4RBuB+vSsRVv9eLrQYj/T63RKbuGQkPr9iQ=", 
            0, 
            "AqhhAmxrgJRDD8A004NtNAHW5OS1ejp71FSYb3+cZgdMFaQYoFTcAA==", 
            "xfxiHFSO5kaPrJ3YmG2v9E2RC6g25Py2eGxhQ85G1T0B");
        console.log('sign is: data:application/octet-stream;base64,' + sign)
        return 1;
      })
    );
  }
}
