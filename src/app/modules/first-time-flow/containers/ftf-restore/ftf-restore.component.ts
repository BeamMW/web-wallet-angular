import { Component, OnInit } from '@angular/core';
import { environment } from '@environment';
import { Router, NavigationExtras } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { selectWasmState } from '../../../../store/selectors/wallet-state.selectors';
import { Observable, Subscription, from } from 'rxjs';
import { routes } from '@consts';
import { 
  WindowService, 
  DataService,
  WasmService
 } from '@app/services';

@Component({
  selector: 'app-ftf-restore',
  templateUrl: './ftf-restore.component.html',
  styleUrls: ['./ftf-restore.component.scss']
})
export class FtfRestoreComponent implements OnInit {
  public iconBack: string = `${environment.assetsPath}/images/modules/send/containers/send-addresses/icon-back.svg`;
  public routesConsts = routes;
  public seedStateToConfirm = [];
  private seedConfirmed = false;

  private WORDS_TO_RESTORE_COUNT = 12;

  public componentSettings = {
    isFullScreen: false,
    backLink: '',
    nextLink: '',
    popupOpened: false,
    fromLink: ''
  };

  constructor(
      private store: Store<any>,
      private windowService: WindowService,
      private wasmService: WasmService,
      private dataService: DataService,
      public router: Router) {
    this.componentSettings.isFullScreen = this.windowService.isFullSize();

    dataService.changeEmitted$.subscribe(emittedState => {
      if (emittedState.popupOpened !== undefined) {
        this.componentSettings.popupOpened = emittedState.popupOpened;
      }
    });

    try {
      const navigation = this.router.getCurrentNavigation();
      const state = navigation.extras.state as {
        from: string
      };
      this.componentSettings.fromLink = state.from;
    } catch (e) {
    }
  }

  ngOnInit() {
    let counter = 0;
    while (counter !== this.WORDS_TO_RESTORE_COUNT) {
      this.seedStateToConfirm.push({
        index: counter,
        value: '',
        inProgress: false,
        confirmed: false
      });
      ++counter;
    }
  }

  wordInputUpdated($event, word) {
    const valueFromInput = $event.target.value;
    if (valueFromInput === null || valueFromInput.length === 0) {
      word.confirmed = false;
      word.inProgress = false;
    } else if (valueFromInput !== null && this.wasmService.isAllowedWord(valueFromInput)) {
      word.confirmed = true;
      word.inProgress = false;
    } else if (valueFromInput !== null && !this.wasmService.isAllowedWord(valueFromInput)) {
      word.confirmed = false;
      word.inProgress = true;
    }

    word.value = valueFromInput;
    this.checkConfirmationState();
  }

  checkConfirmationState() {
    let counter = 0;
    this.seedStateToConfirm.forEach(item => {
      if (item.confirmed) {
        counter++;
      }
    });

    this.seedConfirmed = counter === this.WORDS_TO_RESTORE_COUNT;
  }

  backClicked(event) {
    event.stopPropagation();
    this.router.navigate([this.componentSettings.fromLink])
  }

  restoreClicked() {
    if (this.seedConfirmed) {
      this.dataService.clearWalletData();
      this.dataService.getCoinsState.putState(false);
      let seedWords = [];
      this.seedStateToConfirm.forEach(item => {
        seedWords.push(item.value);
      });

      const navigationExtras: NavigationExtras = {
        state: {
          seedConfirmed: false,
          seed: seedWords.join(' '),
          from: routes.FTF_WALLET_RESTORE_ROUTE
        }
      };
      this.router.navigate([routes.FTF_PASSWORD_CREATE_ROUTE], navigationExtras);
    }
  }
}
