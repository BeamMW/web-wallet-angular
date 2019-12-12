import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import * as passworder from 'browser-passworder';
import { WasmService } from './../../../../wasm.service';
import { WebsocketService } from './../../../websocket';
import { Subscription } from 'rxjs';
import {Router} from '@angular/router';
import {DataService} from './../../../../services/data.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit, OnDestroy {
  @Output() submitted = new EventEmitter<boolean>();
  loginForm: FormGroup;
  sub: Subscription;

  constructor(private wasm: WasmService,
              private wsService: WebsocketService,
              public router: Router,
              private dataService: DataService) {
    this.loginForm = new FormGroup({
      walletPassword: new FormControl('456')
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this.sub !== undefined) {
      this.sub.unsubscribe();
    }
  }

  clearLocalStorage() {
    localStorage.removeItem('wallet');
    this.router.navigate(['/initialize/create']);
  }

  // public submit(): void {
  //   this.submitted.emit(pass);
  // }

  public submit(): void {
    const wallet = localStorage.getItem('wallet');
    const pass = this.loginForm.value.walletPassword;

    if (wallet) {
      passworder.decrypt(pass, wallet).then((result) => {
        this.wasm.keykeeperInit(result.seed).subscribe(value => {
          if (this.wasm.keyKeeper === undefined) {
            this.wasm.keyKeeper = value;
          }
        });

        this.wsService.on().subscribe((msg: any) => {
          if (msg.method !== undefined) {
            console.log('[ws service] on-subscribe: ', msg);
            this.wasm.onkeykeeper(msg);
          }
        });

        this.sub = this.wsService.on().subscribe((msg: any) => {
          if (msg.result && msg.result.length) {
            console.log(`[login] wallet session: ${msg.result}`);
            this.sub.unsubscribe();
            this.dataService.store.putState({active: true}); // app activated
            this.submitted.emit();
          }
        });

        this.wsService.send({
          jsonrpc: '2.0',
          id: 0,
          method: 'open_wallet',
          params: {
            pass,
            id: result.id
          }
        });
      });
    }
  }

}
