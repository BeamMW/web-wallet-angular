import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { environment } from '@environment';
import { WindowService, DataService, WasmService } from '@app/services';
import { routes } from '@consts';
import * as passworder from 'browser-passworder';
import { Store, select } from '@ngrx/store';
import {
  selectWasmState,
  selectError,
  selectWalletLoadState
} from '@app/store/selectors/wallet-state.selectors';

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
  wasmState$: Observable<any>;
  private componentSettings = {
    pass: '',
    seed: '',
    seedConfirmed: false,
    isCreating: false
  };
  sub: any;
  isLoading = true;

  constructor(public router: Router,
              private store: Store<any>,
              private wasmService: WasmService,
              private dataService: DataService,
              private windowService: WindowService) {
    this.isFullScreen = windowService.isFullSize();
    this.bgUrl = `${environment.assetsPath}/images/modules/wallet/containers/login/` +
      (this.isFullScreen ? 'bg-full.svg' : 'bg.svg');

    try {
      const navigation = this.router.getCurrentNavigation();
      const state = navigation.extras.state as {
        isCreating: boolean,
        seed: string,
        pass: string,
        seedConfirmed: boolean
      };

      this.componentSettings.isCreating = state.isCreating;
      if (state.isCreating) {
        this.componentSettings.pass = state.pass;
        this.componentSettings.seed = state.seed;
        this.componentSettings.seedConfirmed = state.seedConfirmed;
      }

    } catch (e) {
    }
  }

  ngOnInit() {
    if (this.componentSettings.isCreating) {
      this.wasmState$ = this.store.pipe(select(selectWasmState));
      this.wasmState$.subscribe((state) => {
        if (state) {
          passworder.encrypt(this.componentSettings.pass, {
            seed: this.componentSettings.seed
          })
          .then((result) => {
            this.dataService.saveWallet(result);
            this.dataService.settingsInit(this.componentSettings.seedConfirmed);
            this.wasmService.createWallet(this.componentSettings.seed, this.componentSettings.pass);
            this.dataService.startWallet();
          });
        }
      }).unsubscribe();
    }

    this.sub = this.store.pipe(select(selectWalletLoadState)).subscribe(state => {
      if (!state) {
        this.router.navigate([routes.WALLET_MAIN_ROUTE]);
      }
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
