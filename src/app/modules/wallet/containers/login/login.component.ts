import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import * as passworder from 'browser-passworder';
import { WasmService } from './../../../../wasm.service';
import { WebsocketService } from './../../../websocket';
import { Subscription } from 'rxjs';
import {Router} from '@angular/router';
import {DataService} from './../../../../services/data.service';
import { environment } from '@environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  sub: Subscription;
  public bgUrl: string = `${environment.assetsPath}/images/modules/wallet/containers/login/bg.svg`;
  public logoUrl: string = `${environment.assetsPath}/images/modules/wallet/containers/login/logo.svg`;
  public loginForm: FormGroup;


  constructor(private wasm: WasmService,
              private wsService: WebsocketService,
              public router: Router,
              private dataService: DataService) {
    this.loginForm = new FormGroup({
      password: new FormControl()
    });
  }

  ngOnInit() {
    const wallet = localStorage.getItem('wallet');
    if (wallet === undefined) {
      this.router.navigate(['/initialize/create']);
    }
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
    const pass = this.loginForm.value.password;

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
            this.router.navigate(['/wallet/main']);
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
