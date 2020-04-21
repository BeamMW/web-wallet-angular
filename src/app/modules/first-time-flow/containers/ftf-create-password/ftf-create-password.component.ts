import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from '@environment';
import { Router  } from '@angular/router';
import { WasmService } from '../../../../wasm.service';
import { Store, select } from '@ngrx/store';
import { selectWasmState } from '../../../../store/selectors/wallet-state.selectors';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import * as passworder from 'browser-passworder';
import { DataService, WindowService, LoginService, WebsocketService } from './../../../../services';
import { ChangeWalletState } from './../../../../store/actions/wallet.actions';

import { routes } from '@consts';

@Component({
  selector: 'app-ftf-create-password',
  templateUrl: './ftf-create-password.component.html',
  styleUrls: ['./ftf-create-password.component.scss']
})
export class FtfCreatePasswordComponent implements OnInit, OnDestroy {
  public iconBack: string = `${environment.assetsPath}/images/modules/send/containers/send-addresses/icon-back.svg`;

  private seedConfirmed: boolean;
  private seed: string;

  private sub: Subscription;
  private loginSub: Subscription;
  createForm: FormGroup;
  isFullScreen = false;

  private wasmState$: Observable<any>;

  constructor(
      private store: Store<any>,
      private wasm: WasmService,
      public router: Router,
      private websocketService: WebsocketService,
      private windowService: WindowService,
      private loginService: LoginService,
      private dataService: DataService) {
    this.isFullScreen = this.windowService.isFullSize();
    this.createForm = new FormGroup({
      password: new FormControl('', Validators.required),
      passwordConfirm: new FormControl('', Validators.required)
    });

    try {
      const navigation = this.router.getCurrentNavigation();
      const state = navigation.extras.state as {
        seedConfirmed: boolean,
        seed: string
      };
      this.seedConfirmed = state.seedConfirmed;
      this.seed = state.seed;
    } catch (e) {
        this.router.navigate([routes.FTF_VIEW_SEED_ROUTE]);
    }
  }

  ngOnInit() {
    this.loginToService();
  }

  loginToService() {
    this.wasmState$ = this.store.pipe(select(selectWasmState));
    this.wasmState$.subscribe((state) => {
      if (state) {
        this.wasm.keykeeperInit(this.seed).subscribe(value => {
          if (this.wasm.keyKeeper !== undefined) {
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
                  }
              } else {
                  console.log('login_ws: failed');
                  if (msg.error) {
                      console.log(`login_ws: error code:${msg.error.code} text:${msg.error.data}`)
                  }
              }

              if (this.loginSub) {
                this.loginSub.unsubscribe();
              }
            });
          }
        });
      }
    });
  }

  private loginToCreatedWallet(id: string, pass: string) {
    this.sub = this.websocketService.on().subscribe((msg: any) => {
      if (msg.result && msg.result.length) {
        console.log(`[login] wallet session: ${msg.result}`);
        this.sub.unsubscribe();
        this.store.dispatch(ChangeWalletState({walletState: true}));
        this.router.navigate([routes.WALLET_MAIN_ROUTE]);
      }
    });

    this.websocketService.send({
      jsonrpc: '2.0',
      id: 0,
      method: 'open_wallet',
      params: {
        pass,
        id
      }
    });
  }

  public submit(): void {
    const pass = this.createForm.value.password;
    const confirmPass = this.createForm.value.passwordConfirm;

    if (confirmPass === pass && this.websocketService.connected) {
      console.log(`[create-wallet] Creating new wallet with seed phrase: ${this.seed}`);
      const ownerKey = this.wasm.keyKeeper.getOwnerKey(pass);
      console.log('[create-wallet] ownerKey is: data:application/octet-stream;base64,' + ownerKey);

      this.sub = this.websocketService.on().subscribe((msg: any) => {
        console.log('[create-wallet] got response: ');
        console.dir(msg);
        if (msg.result && msg.result.length) {
          console.log(`[create-wallet] wallet session: ${msg.result}`);

          passworder.encrypt(pass, {seed: this.seed, id: msg.result})
            .then((result) => {
              this.dataService.saveWallet(result);
              this.dataService.settingsInit(this.seedConfirmed);
              this.sub.unsubscribe();
              this.loginToCreatedWallet(msg.result, pass);
            });
        }
      });

      this.websocketService.send({
          jsonrpc: '2.0',
          id: 0,
          method: 'create_wallet',
          params: {
            pass: pass,
            ownerkey: ownerKey
          }
      });
    }
  }

  backClicked(event) {
    event.stopPropagation();
    this.router.navigate([routes.FTF_VIEW_SEED_ROUTE]);
  }

  ngOnDestroy() {
    if (this.sub !== undefined) {
      this.sub.unsubscribe();
    }

    if (this.loginSub) {
      this.loginSub.unsubscribe();
    }
  }
}
