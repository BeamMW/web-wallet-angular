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
      private wasmService: WasmService,
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
    this.dataService.loginToService(this.seed, false);
  }

  public submit(): void {
    const pass = this.createForm.value.password;
    const confirmPass = this.createForm.value.passwordConfirm;

    if (confirmPass === pass) {
      console.log(`[create-wallet] Creating new wallet with seed phrase: ${this.seed}`);
      this.wasmService.keykeeperInit(this.seed).subscribe(value => {
        const ownerKey = this.wasmService.keyKeeper.getOwnerKey(pass);
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
                this.dataService.loginToWallet(msg.result, pass);
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
