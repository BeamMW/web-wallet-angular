import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import * as passworder from 'browser-passworder';
import { WasmService } from './../../../../wasm.service';
import { WebsocketService } from './../../../websocket';
import { Subscription, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { DataService, WindowService } from './../../../../services';
import { environment } from '@environment';
import { Store, select } from '@ngrx/store';
import { ChangeWalletState, saveWallet, optionsUpdate } from './../../../../store/actions/wallet.actions';
import { selectWalletData } from './../../../../store/selectors/wallet-state.selectors';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  sub: Subscription;
  public loginForm: FormGroup;
  public isFullScreen: boolean;
  public bgUrl: string = '';
  public logoUrl: string = `${environment.assetsPath}/images/modules/wallet/containers/login/logo.svg`;

  wallet$: Observable<any>;

  constructor(private store: Store<any>,
              private wasm: WasmService,
              private wsService: WebsocketService,
              private windowService: WindowService,
              public router: Router,
              private dataService: DataService) {
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

  clearLocalStorage() {
    localStorage.removeItem('wallet');
    this.router.navigate(['/initialize/create']);
  }

  // public submit(): void {
  //   this.submitted.emit(pass);
  // }

  public submit(): void {
    const pass = this.loginForm.value.password;

    this.wallet$ = this.store.pipe(select(selectWalletData));
    this.wallet$.subscribe(wallet => {
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
            this.store.dispatch(ChangeWalletState({walletState: true}));
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
    })
  }
}
