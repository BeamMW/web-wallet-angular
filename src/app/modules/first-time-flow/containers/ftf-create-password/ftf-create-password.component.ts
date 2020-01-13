import { Component, OnInit } from '@angular/core';
import { environment } from '@environment';
import { Router } from '@angular/router';
import { WasmService } from '../../../../wasm.service';
import { Store, select } from '@ngrx/store';
import { selectSeedPhrase } from '../../../../store/selectors/wallet-state.selectors';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import * as passworder from 'browser-passworder';
import { WebsocketService } from '../../../websocket';
import { DataService } from './../../../../services/data.service';

@Component({
  selector: 'app-ftf-create-password',
  templateUrl: './ftf-create-password.component.html',
  styleUrls: ['./ftf-create-password.component.scss']
})
export class FtfCreatePasswordComponent implements OnInit {
  public iconBack: string = `${environment.assetsPath}/images/modules/send/containers/send-addresses/icon-back.svg`;
  seedPhrase$: Observable<any>;
  seedPhraseValue: string;
  private sub: Subscription;
  createForm: FormGroup;

  constructor(
      private store: Store<any>,
      private wasm: WasmService,
      public router: Router,
      private wsService: WebsocketService,
      private dataService: DataService) {
    this.createForm = new FormGroup({
      password: new FormControl(),
      passwordConfirm: new FormControl()
    });
  }

  ngOnInit() {
    this.seedPhrase$ = this.store.pipe(select(selectSeedPhrase));
    this.sub = this.seedPhrase$.subscribe((state) => {
        if (state) {
          this.seedPhraseValue = state;
          if (this.sub) {
            this.sub.unsubscribe();
          }
        }
    });
  }


  public submit(): void {
    const pass = this.createForm.value.password;
    const confirmPass = this.createForm.value.passwordConfirm;
    if (confirmPass === pass) {
      this.wasm.keykeeperInit(this.seedPhraseValue).subscribe(keyKeeper => {
        this.wasm.keyKeeper = keyKeeper;

        console.log(`Creating new wallet with seed phrase: ${this.seedPhraseValue}`);
        const ownerKey = keyKeeper.getOwnerKey(pass);
        console.log('ownerKey is: data:application/octet-stream;base64,' + ownerKey);

        this.sub = this.wsService.on().subscribe((msg: any) => {
          console.log('got response: ');
          console.dir(msg);
          if (msg.result && msg.result.length) {
            console.log(`wallet session: ${msg.result}`);

            passworder.encrypt(pass, {seed: this.seedPhraseValue, id: msg.result})
              .then((result) => {
                console.log('Encrypted: ', result);
                //localStorage.setItem('wallet', result);
                this.dataService.saveWallet(result);
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

  backClicked(event) {
    event.stopPropagation();
    this.router.navigate(['/initialize/view-seed']);
  }
}
