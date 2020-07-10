import { Component, OnInit } from '@angular/core';
import { environment } from '@environment';
import { Router, NavigationExtras } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { selectWasmState } from '../../../../store/selectors/wallet-state.selectors';
import { Observable, Subscription, from } from 'rxjs';
import { WindowService, DataService } from '../../../../services';
import { routes } from '@consts';

@Component({
  selector: 'app-ftf-confirm-seed',
  templateUrl: './ftf-confirm-seed.component.html',
  styleUrls: ['./ftf-confirm-seed.component.scss']
})

export class FtfConfirmSeedComponent implements OnInit {
  public iconBack: string = `${environment.assetsPath}/images/modules/send/containers/send-addresses/icon-back.svg`;
  public routesConsts = routes;

  private sub: Subscription;
  private seedState = [];
  public seedStateToConfirm = [];
  private seedConfirmed = false;

  private WORDS_TO_CONFIRM_COUNT = 6;

  componentSettings = {
    isFullScreen: false,
    backLink: '',
    nextLink: '',
    isFromFTF: true,
    popupOpened: false
  };

  constructor(
      private store: Store<any>,
      private windowService: WindowService,
      private dataService: DataService,
      public router: Router) {
    this.componentSettings.isFullScreen = this.windowService.isFullSize();
    try {
      const navigation = this.router.getCurrentNavigation();
      const state = navigation.extras.state as {seed: string, backLink: string, nextLink: string, isFromFTF: boolean};
      this.seedState = state.seed.split(' ');
      this.componentSettings.backLink = state.backLink;
      this.componentSettings.nextLink = state.nextLink;
      this.componentSettings.isFromFTF = state.isFromFTF;

      const idsUsedToConfirm = [];
      while (idsUsedToConfirm.length !== this.WORDS_TO_CONFIRM_COUNT) {
        const newItemId = Math.floor(Math.random() * 12);
        if (idsUsedToConfirm.includes(newItemId)) {
          continue;
        } else {
          this.seedStateToConfirm.push({
            value: this.seedState[newItemId],
            index: newItemId,
            inProgress: false,
            confirmed: false
          });
          idsUsedToConfirm.push(newItemId);
        }
      }
    } catch (e) {
      this.dataService.loadWalletData().then(walletData => {
        if (walletData !== undefined) {
            this.router.navigate([routes.WALLET_MAIN_ROUTE]);
        }
      });
    }

    dataService.changeEmitted$.subscribe(emittedState => {
      if (emittedState.popupOpened !== undefined) {
        this.componentSettings.popupOpened = emittedState.popupOpened;
      }
    });
  }
  ngOnInit() {
  }

  wordInputUpdated($event, word) {
    const valueFromInput = $event.target.value;
    if (valueFromInput === null || valueFromInput.length === 0) {
      word.confirmed = false;
      word.inProgress = false;
    } else if (valueFromInput !== null && valueFromInput === word.value) {
      word.confirmed = true;
      word.inProgress = false;
    } else if (valueFromInput !== null && valueFromInput !== word.value) {
      word.confirmed = false;
      word.inProgress = true;
    }
    this.checkConfirmationState();
  }

  checkConfirmationState() {
    let counter = 0;
    this.seedStateToConfirm.forEach(item => {
      if (item.confirmed) {
        counter++;
      }
    });

    this.seedConfirmed = counter === this.WORDS_TO_CONFIRM_COUNT;
  }

  backClicked(event) {
    event.stopPropagation();
    if (this.componentSettings.isFromFTF) {
      this.router.navigate([this.router.url, { outlets: { popup: 'return-to-seed' }}]);
    } else {
      const navigationExtras: NavigationExtras = {
        state: {
          seed: this.seedState.join(' '),
          backLink: routes.WALLET_MAIN_ROUTE,
          nextLink: routes.WALLET_MAIN_ROUTE,
          isFromFTF: false
        }
      };
      this.router.navigate([routes.FTF_VIEW_SEED_ROUTE], navigationExtras);
    }
  }

  nextClicked() {
    if (this.seedConfirmed) {
      if (this.componentSettings.isFromFTF) {
        const navigationExtras: NavigationExtras = {
          state: {
            seedConfirmed: true,
            seed: this.seedState.join(' ')
          }
        };
        this.router.navigate([this.componentSettings.nextLink], navigationExtras);
      } else {
        this.dataService.updateVerificatedSettingOnInit();
        this.dataService.saveWalletOptions();
        this.router.navigate([this.componentSettings.nextLink]);
      }
    }
  }
}
