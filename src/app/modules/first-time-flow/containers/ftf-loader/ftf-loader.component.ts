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
  selectError
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
  private keeperSub: Subscription;
  private sub: Subscription;
  private errorSub: Subscription;
  errorState$: Observable<any>;
  wasmState$: Observable<any>;
  private componentSettings = {
    pass: '',
    seed: '',
    seedConfirmed: false
  };

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
            this.dataService.loginToWallet(this.componentSettings.pass);
          });
        }
      });
  }

  ngOnDestroy() {
    if (this.errorSub !== undefined) {
      this.errorSub.unsubscribe();
    }
  }
}
