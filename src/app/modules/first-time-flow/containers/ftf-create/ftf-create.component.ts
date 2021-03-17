import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationExtras, Router} from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { environment } from '@environment';
import { WindowService, DataService } from '@app/services';
import { popupRoutes, routes } from '@consts';
import { Store, select } from '@ngrx/store';
import {
  selectError
} from '@app/store/selectors/wallet-state.selectors';
import { saveError } from '@app/store/actions/wallet.actions';
@Component({
  selector: 'app-ftf-create',
  templateUrl: './ftf-create.component.html',
  styleUrls: ['./ftf-create.component.scss']
})
export class FtfCreateComponent implements OnInit, OnDestroy {
  public bgUrl: string;
  public logoUrl: string = `${environment.assetsPath}/images/modules/wallet/containers/login/logo.svg`;
  public isFullScreen = false;
  public popupOpened = false;
  errorState$: Observable<any>;
  private popupSub: Subscription;

  constructor(public router: Router,
              private store: Store<any>,
              private dataService: DataService,
              private windowService: WindowService) {
    this.isFullScreen = windowService.isFullSize();
    this.bgUrl = `${environment.assetsPath}/images/modules/wallet/containers/login/` +
      (this.isFullScreen ? 'bg-full.svg' : 'bg.svg');

    this.popupSub = dataService.changeEmitted$.subscribe(emittedState => {
      if (emittedState.popupOpened !== undefined) {
        this.popupOpened = emittedState.popupOpened;
      }
    });
  }

  ngOnInit() {
    this.errorState$ = this.store.pipe(select(selectError));
  }

  ngOnDestroy() {
    this.popupSub.unsubscribe();
  }

  restoreClicked() {
    const navigationExtras: NavigationExtras = {
      state: {
        from: routes.FTF_CREATE_WALLET_ROUTE,
      }
    };
    this.router.navigate([routes.FTF_WALLET_RESTORE_ROUTE], navigationExtras);
  }

  newWalletClicked() {
    this.store.dispatch(saveError({errorValue:
      {
        gotAnError: false,
        errorMessage: ''
      }
    }));
    this.router.navigate([routes.FTF_GENERATE_SEED_ROUTE]);
  }
}
