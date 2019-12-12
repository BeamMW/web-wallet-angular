import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import { webSocket } from 'rxjs/webSocket';
import {Router} from '@angular/router';
import * as passworder from 'browser-passworder';
import * as ObservableStore from 'obs-store';
import { WasmService } from './../../../../wasm.service';
import { Subscription } from 'rxjs';

import { WebsocketService } from './../../../websocket';

@Component({
  selector: 'app-ftf-create',
  templateUrl: './ftf-create.component.html',
  styleUrls: ['./ftf-create.component.scss']
})
export class FtfCreateComponent implements OnInit, OnDestroy {
  sub: Subscription;
  createForm: FormGroup;
  walletStore: any;

  constructor(private wasm: WasmService, public router: Router, private wsService: WebsocketService) {
    this.createForm = new FormGroup({
      seedPhrase: new FormControl('copy vendor shallow raven coffee appear book blast lock exchange farm glue'),
      walletPassword: new FormControl('456')
    });

    this.walletStore = new ObservableStore({
      isUnlocked: false,
      wallet: {},
    });
   }

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this.sub !== undefined) {
      this.sub.unsubscribe();
    }
  }

  public submit(): void {
    const seed = this.createForm.value.seedPhrase;
    const pass = this.createForm.value.walletPassword;
    this.wasm.keykeeperInit(seed).subscribe(keyKeeper => {
      this.wasm.keyKeeper = keyKeeper;

      console.log(`Creating new wallet with seed phrase: ${seed}`);
      const ownerKey = keyKeeper.getOwnerKey(pass);
      console.log('ownerKey is: data:application/octet-stream;base64,' + ownerKey);

      this.sub = this.wsService.on().subscribe((msg: any) => {
        console.log('got response: ');
        console.dir(msg);
        if (msg.result && msg.result.length) {
          console.log(`wallet session: ${msg.result}`);

          passworder.encrypt(pass, {seed: seed, id: msg.result})
            .then((result) => {
              console.log('Encrypted: ', result);
              // this.walletStore.updateState({ wallet: result });
              localStorage.setItem('wallet', result);
              this.sub.unsubscribe();
              this.router.navigate(['/wallet/login']);
              // return passworder.decrypt(pass, result)
              //   .then((final) => {
              //     console.log('Decrypted: ', final);
              //   });
            });
        } else {
          this.wasm.onkeykeeper(msg);
        }
      });

      this.wsService.send({
          jsonrpc: '2.0',
          id: 0,
          method: 'create_wallet',
          params: {
            pass: pass,
            ownerkey: ownerKey
          }
      });
    });
  }
}
