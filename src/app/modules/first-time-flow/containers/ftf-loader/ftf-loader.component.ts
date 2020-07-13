import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { environment } from '@environment';
import { WindowService, DataService, LoginService, WebsocketService } from '../../../../services';
import { routes } from '@consts';
import { popupRoutes } from '@consts';
import { WasmService } from '../../../../wasm.service';
import * as passworder from 'browser-passworder';
import { Store, select } from '@ngrx/store';
import { saveError } from '../../../../store/actions/wallet.actions';
import {
  selectError
} from './../../../../store/selectors/wallet-state.selectors';
@Component({
  selector: 'app-ftf-loader',
  templateUrl: './ftf-loader.component.html',
  styleUrls: ['./ftf-loader.component.scss']
})
export class FtfLoaderComponent implements OnInit, OnDestroy {
  public bgUrl: string;
  public logoUrl: string = `${environment.assetsPath}/images/modules/wallet/containers/login/logo.svg`;
  public isFullScreen = false;
  public popupOpened = false;
  private keeperSub: Subscription;
  private sub: Subscription;
  private errorSub: Subscription;
  errorState$: Observable<any>;

  private componentSettings = {
    pass: '',
    seed: '',
    seedConfirmed: false
  };

  constructor(public router: Router,
              private store: Store<any>,
              private wasmService: WasmService,
              private dataService: DataService,
              private websocketService: WebsocketService,
              private windowService: WindowService) {
    this.isFullScreen = windowService.isFullSize();
    this.bgUrl = `${environment.assetsPath}/images/modules/wallet/containers/login/` +
      (this.isFullScreen ? 'bg-full.svg' : 'bg.svg');

    try {
      const navigation = this.router.getCurrentNavigation();
      const state = navigation.extras.state as {seed: string, pass: string, seedConfirmed: boolean};

      this.componentSettings.pass = state.pass;
      this.componentSettings.seed = state.seed;
      this.componentSettings.seedConfirmed = state.seedConfirmed;

    } catch (e) {
    }

    this.errorState$ = this.store.pipe(select(selectError));
    this.errorSub = this.errorState$.subscribe(value => {
      if (value.gotAnError) {
        if (this.sub !== undefined) {
          this.sub.unsubscribe();
        }

        if (this.keeperSub !== undefined) {
          this.keeperSub.unsubscribe();
        }
        this.router.navigate([routes.FTF_CREATE_WALLET_ROUTE]);
      }
    });
  }

  ngOnInit() {
    this.keeperSub = this.wasmService.keykeeperInit(this.componentSettings.seed).subscribe(value => {
      const ownerKey = this.wasmService.keyKeeper.getOwnerKey(this.componentSettings.pass);
      this.sub = this.websocketService.on().subscribe((msg: any) => {
        if (msg.result && msg.result.length) {
          passworder.encrypt(this.componentSettings.pass, {
              seed: this.componentSettings.seed,
              id: msg.result
            })
            .then((result) => {
              this.dataService.saveWallet(result);
              this.dataService.settingsInit(this.componentSettings.seedConfirmed);
              this.dataService.loginToWallet(msg.result, this.componentSettings.pass);
            });
        }

        if (msg.error !== undefined) {
          if (msg.error.code === -32013) {
            this.store.dispatch(saveError({errorValue:
              {
                gotAnError: true,
                errorMessage: 'Database not found'
              }
            }));
          } else if (msg.error.code === -32012) {
            this.store.dispatch(saveError({errorValue:
              {
                gotAnError: true,
                errorMessage: 'Database error'
              }
            }));
          } else if (msg.error.code === -32600) {
            this.store.dispatch(saveError({errorValue:
              {
                gotAnError: true,
                errorMessage: 'Parse error'
              }
            }));
          } else if (msg.error.code === -32603) {
            this.store.dispatch(saveError({errorValue:
              {
                gotAnError: true,
                errorMessage: 'Generic internal error'
              }
            }));
          }

          this.router.navigate([routes.FTF_CREATE_WALLET_ROUTE]);
        }

        this.sub.unsubscribe();
        this.keeperSub.unsubscribe();
      });

      this.websocketService.send({
        jsonrpc: '2.0',
        id: 0,
        method: 'create_wallet',
        params: {
          pass: this.componentSettings.pass,
          ownerkey: ownerKey
        }
      });
    });
  }

  ngOnDestroy() {
    if (this.errorSub !== undefined) {
      this.errorSub.unsubscribe();
    }
  }
}
