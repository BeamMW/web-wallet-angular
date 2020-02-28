import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import * as passworder from 'browser-passworder';
import { WasmService } from './../../../../wasm.service';
import { Subscription, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { DataService, WindowService, LoginService, WebsocketService } from './../../../../services';
import { environment } from '@environment';
import { Store, select } from '@ngrx/store';
import { ChangeWalletState, saveWallet, optionsUpdate } from './../../../../store/actions/wallet.actions';
import { selectWalletData, selectWasmState } from './../../../../store/selectors/wallet-state.selectors';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  sub: Subscription;
  loginSub: Subscription;
  public loginForm: FormGroup;
  public isFullScreen: boolean;
  public bgUrl: string = '';
  public logoUrl: string = `${environment.assetsPath}/images/modules/wallet/containers/login/logo.svg`;

  wallet$: Observable<any>;
  wasmState$: Observable<any>;

  private id;
  private pass;

  constructor(private store: Store<any>,
              private wasm: WasmService,
              private websocketService: WebsocketService,
              private windowService: WindowService,
              public router: Router,
              private dataService: DataService,
              private loginService: LoginService) {
    this.isFullScreen = windowService.isFullSize();
    this.bgUrl = `${environment.assetsPath}/images/modules/wallet/containers/login/` +
      (this.isFullScreen ? 'bg-full.svg' : 'bg.svg');
    this.loginForm = new FormGroup({
      password: new FormControl()
    });
  }

  ngOnInit() {
    this.dataService.loadWalletData().then(walletData => {
      if (walletData !== undefined && walletData.length > 0) {
          console.log('Wallet: ', walletData);
          this.store.dispatch(saveWallet({wallet: walletData}));
          this.store.dispatch(ChangeWalletState({walletState: true}));
      } else {
          this.router.navigate(['/initialize/create']);
          return false;
      }
    });

    this.dataService.loadWalletOptions().then(optionsData => {
      this.store.dispatch(optionsUpdate({options: optionsData}));
    });
  }

  ngOnDestroy() {
    if (this.sub !== undefined) {
      this.sub.unsubscribe();
    }
  }

  // public submit(): void {
  //   this.submitted.emit(pass);
  // }

  private login() {
    this.websocketService.on().subscribe((msg: any) => {
      if (msg.method !== undefined) {
        console.log('[ws service] on-subscribe: ', msg);
        this.websocketService.onkeykeeper(msg);
      }
    });

    this.sub = this.websocketService.on().subscribe((msg: any) => {
      if (msg.result && msg.result.length) {
        console.log(`[login] wallet session: ${msg.result}`);
        this.sub.unsubscribe();
        this.store.dispatch(ChangeWalletState({walletState: true}));
        this.router.navigate(['/wallet/main']);
      }
    });

    this.websocketService.send({
      jsonrpc: '2.0',
      id: 0,
      method: 'open_wallet',
      params: {
        pass: this.pass,
        id: this.id
      }
    });
  }

  public submit(): void {
    this.pass = this.loginForm.value.password;
    this.wallet$ = this.store.pipe(select(selectWalletData));
    this.wallet$.subscribe(wallet => {
      passworder.decrypt(this.pass, wallet).then((result) => {
        this.id = result.id;

        this.wasm.keykeeperInit(result.seed).subscribe(value => {
          if (!this.loginService.connected) {
            this.loginService.init();
            this.loginService.connect();
            this.loginService.send({
                jsonrpc: '2.0',
                id: 123,
                method: 'login',
                params: this.loginService.loginParams
            });

            this.loginSub = this.loginService.on().subscribe((msg: any) => {
              if (msg.result) {
                  if (msg.id === 123) {
                      console.log('login_ws: OK, endpoint is ', msg.result.endpoint);
                      const endpoint = ['ws://',  msg.result.endpoint].join('');
                      this.websocketService.url = endpoint;
                      this.websocketService.connect();
                      this.login();
                  }
              } else {
                  console.log('login_ws: failed')
                  if (msg.error) {
                      console.log(`login_ws: error code:${msg.error.code} text:${msg.error.data}`)
                  }
              }

              if (this.loginSub) {
                this.loginSub.unsubscribe();
              }
            });
          } else {
            this.login();
          }
        });
      });
    });
  }
}
