import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from '@environment';
import { Router, NavigationExtras } from '@angular/router';
import { WasmService } from '../../../../services/wasm.service';
import { Store, select } from '@ngrx/store';
import { selectWasmState } from '../../../../store/selectors/wallet-state.selectors';
import { Observable, Subscription, from } from 'rxjs';
import { addSeedPhrase } from './../../../../store/actions/wallet.actions';
import { WindowService, DataService } from '../../../../services';
import { routes } from '@consts';

@Component({
  selector: 'app-ftf-view-seed',
  templateUrl: './ftf-view-seed.component.html',
  styleUrls: ['./ftf-view-seed.component.scss']
})
export class FtfViewSeedComponent implements OnInit, OnDestroy {
  public iconBack: string = `${environment.assetsPath}/images/modules/send/containers/send-addresses/icon-back.svg`;

  seed: string;
  wasmState$: Observable<any>;
  private sub: Subscription;
  public isFullScreen = false;
  seedState = [];
  popupOpened = false;

  componentSettings = {
    backLink: '',
    nextLink: '',
    isFromFTF: true,
  };

  constructor(
      private store: Store<any>,
      private wasm: WasmService,
      private windowService: WindowService,
      private dataService: DataService,
      public router: Router) {
    try {
      const navigation = this.router.getCurrentNavigation();
      const state = navigation.extras.state as {seed: string, backLink: string, nextLink: string, isFromFTF: boolean};
      this.seedState = state.seed.split(' ');
      this.seed = state.seed;
      this.componentSettings.backLink = state.backLink;
      this.componentSettings.nextLink = state.nextLink;
      this.componentSettings.isFromFTF = state.isFromFTF;
    } catch (e) {
      this.dataService.loadWalletData().then(walletData => {
        if (walletData !== undefined) {
            this.router.navigate([routes.WALLET_MAIN_ROUTE]);
        }
      });
    }

    this.isFullScreen = this.windowService.isFullSize();

    dataService.changeEmitted$.subscribe(emittedState => {
      if (emittedState.popupOpened !== undefined) {
        this.popupOpened = emittedState.popupOpened;
      }
    });
  }

  ngOnInit() {
    if (this.componentSettings.isFromFTF) {
      this.wasmState$ = this.store.pipe(select(selectWasmState));
      this.sub = this.wasmState$.subscribe((state) => {
          if (state) {
            this.seed = this.wasm.getSeedPhrase();
            this.seedState = this.seed.split(' ');
            this.store.dispatch(addSeedPhrase({seedPhraseValue: this.seed}));
            if (this.sub) {
              this.sub.unsubscribe();
            }
          }
      });
    }
  }

  ngOnDestroy() {
    if (this.sub !== undefined) {
      this.sub.unsubscribe();
    }
  }

  completeVerificationClicked($event) {
    $event.stopPropagation();
    const navigationExtras: NavigationExtras = {
      state: {
        seed: this.seed,
        backLink: routes.FTF_VIEW_SEED_ROUTE,
        nextLink: routes.FTF_PASSWORD_CREATE_ROUTE,
        isFromFTF: this.componentSettings.isFromFTF,
        directionLink: routes.FTF_CONFIRM_SEED_ROUTE
      }
    };
    this.router.navigate([this.router.url, { outlets: { popup: 'save-seed' }}], navigationExtras);
  }

  laterClicked($event) {
    $event.stopPropagation();
    const navigationExtras: NavigationExtras = {
      state: {
        seedConfirmed: false,
        seed: this.seed,
        from: routes.FTF_VIEW_SEED_ROUTE
      }
    };
    this.router.navigate([routes.FTF_PASSWORD_CREATE_ROUTE], navigationExtras);
  }

  backClicked(event) {
    event.stopPropagation();
    this.router.navigate([!this.componentSettings.isFromFTF ? this.componentSettings.backLink : routes.FTF_GENERATE_SEED_ROUTE]);
  }
}
