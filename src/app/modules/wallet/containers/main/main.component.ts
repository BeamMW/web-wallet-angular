import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, Observable, from } from 'rxjs';
import { Store, select } from '@ngrx/store';
import {
  updatePrivacySetting,
  updateVerificatedSetting
} from '@app/store/actions/wallet.actions';
import { selectAllAddresses } from '@app/store/selectors/address.selectors';
import { selectAllUtxo } from '@app/store/selectors/utxo.selectors';
import {
  selectAllTr,
  selectInProgressTr,
  selectReceivedTr,
  selectSentTr
} from '@app/store/selectors/transaction.selectors';
import {
  selectPrivacySetting,
  selectVerificatedSetting,
  selectWalletStatus
} from '@app/store/selectors/wallet-state.selectors';
import { DataService, WindowService } from '@app/services';
import { routes, globalConsts } from '@consts';

import { environment } from '@environment';

export enum selectorTitles {
  ALL = 'All',
  IN_PROGRESS = 'In progress',
  SENT = 'Sent',
  RECEIVED = 'Received'
}
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {
  private basePath = `${environment.assetsPath}`;
  public iconBeam: string = this.basePath + `/images/modules/wallet/containers/main/ic-beam.svg`;
  public iconBeamFull: string = this.basePath + `/images/modules/wallet/containers/main/icon-beam-full.svg`;
  public iconReceived: string = this.basePath + `/images/modules/wallet/containers/main/icon-received.svg`;
  public iconSent: string = this.basePath + `/images/modules/wallet/containers/main/icon-sent.svg`;
  public iconMenu: string = this.basePath + `/images/modules/wallet/containers/main/icon-menu.svg`;
  public iconEmpty: string = this.basePath + `/images/modules/wallet/containers/main/atomic-empty-state.svg`;
  public iconDisabledPrivacy: string = this.basePath + `/images/modules/wallet/containers/main/icn-eye.svg`;
  public iconEnabledPrivacy: string = this.basePath + `/images/modules/wallet/containers/main/icn-eye-crossed.svg`;
  public iconEnabledPrivacyGrayed: string = this.basePath + `/images/modules/wallet/containers/main/icn-eye-crossed-gray.svg`;
  public iconEmptyTransactions: string = this.basePath + `/images/modules/wallet/containers/main/icon-wallet.svg`;
  public iconGetCoinsButton: string = this.basePath + `/images/modules/wallet/containers/main/icon-receive-blue.svg`;

  private iconComment = this.basePath + `/images/modules/addresses/components/address-element/icon-comment.svg`;
  public iconClose = this.basePath + `/images/modules/receive/components/qr-popup/ic-cancel.svg`;

  public sendRoute = '/send/addresses';
  public receiveRoute = '/receive/page';
  public tableType = 'wallet';
  public tableColumns = ['created', 'from', 'to', 'amount', 'status', 'actions'];

  public selectorTitlesData = selectorTitles;
  public trSelectorActiveTitle = selectorTitles.ALL;

  addresses$: Observable<any>;
  utxos$: Observable<any>;
  transactions$: Observable<any>;
  verificatedSetting$: Observable<any>;
  privacySetting$: Observable<any>;
  walletStatus$: Observable<any>;
  addressesColumns: string[] = ['address', 'created', 'comment'];
  utxoColumns: string[] = ['utxo', 'amount', 'status'];
  transcationsColumns: string[] = ['sender', 'value', 'txId'];

  verificatedSetting = null;
  privacyMode = false;
  isFullScreen = false;
  activeSidenavItem = '';
  popupOpened = false;
  modalOpened = false;

  componentSettings = {
    isAvailableEnough: false,
    isValidationVisible: true,
    isGetCoinsVisible: true,
    validationState: true,
    validationStateLoaded: false
  };

  constructor(private store: Store<any>,
              public router: Router,
              private windowService: WindowService,
              private dataService: DataService) {
    this.isFullScreen = windowService.isFullSize();
    this.addresses$ = this.store.pipe(select(selectAllAddresses));
    this.utxos$ = this.store.pipe(select(selectAllUtxo));
    this.transactions$ = this.store.pipe(select(selectAllTr));
    this.privacySetting$ = this.store.pipe(select(selectPrivacySetting));
    this.walletStatus$ = this.store.pipe(select(selectWalletStatus));

    this.verificatedSetting$ = this.store.pipe(select(selectVerificatedSetting));
    this.verificatedSetting$.subscribe((verState) => {
      this.verificatedSetting = verState;

      this.walletStatus$.subscribe((walletState) => {
        this.componentSettings.isAvailableEnough = verState.balanceWasPositiveMoreEn ||
          (!verState.balanceWasPositiveMoreEn && (parseFloat(walletState.receiving) >= 100 * globalConsts.GROTHS_IN_BEAM ||
          parseFloat(walletState.available) >= 100 * globalConsts.GROTHS_IN_BEAM));

        this.componentSettings.validationState = !this.verificatedSetting.state &&
          (!this.verificatedSetting.isMessageClosed ||
          (this.verificatedSetting.isMessageClosed && this.componentSettings.isAvailableEnough));

        this.componentSettings.validationStateLoaded = true;
        this.componentSettings.isValidationVisible = this.componentSettings.validationState;
        this.componentSettings.isGetCoinsVisible = !verState.balanceWasPositive &&
          walletState.available === 0 && !this.dataService.getCoinsState.getState();
      });
    });

    this.privacySetting$.subscribe((state) => {
      this.privacyMode = state;
    });

    dataService.changeEmitted$.subscribe(emittedState => {
      if (emittedState.popupOpened !== undefined) {
        this.popupOpened = emittedState.popupOpened;
      } else {
        this.modalOpened = emittedState;
      }
    });
  }

  ngOnInit() {}

  ngOnDestroy() {}

  sideMenuClicked($event) {
    this.dataService.clickedElement = $event.currentTarget;
    this.router.navigate([this.router.url, { outlets: { sidemenu: 'menu' }}]);
  }

  showAllTransactions() {
    this.router.navigate([routes.TRANSACTIONS_LIST_ROUTE]);
  }

  privacyControlClicked() {
    this.privacyMode = !this.privacyMode;
    this.store.dispatch(updatePrivacySetting({settingValue: this.privacyMode}));
    this.dataService.saveWalletOptions();
  }

  selectorItemAllClicked() {
    this.transactions$ = this.store.pipe(select(selectAllTr));
    this.trSelectorActiveTitle = selectorTitles.ALL;
  }

  selectorItemInProgressClicked() {
    this.transactions$ = this.store.pipe(select(selectInProgressTr));
    this.trSelectorActiveTitle = selectorTitles.IN_PROGRESS;
  }

  selectorItemSentClicked() {
    this.transactions$ = this.store.pipe(select(selectSentTr));
    this.trSelectorActiveTitle = selectorTitles.SENT;
  }

  selectorItemReceivedClicked() {
    this.transactions$ = this.store.pipe(select(selectReceivedTr));
    this.trSelectorActiveTitle = selectorTitles.RECEIVED;
  }

  getValueSign(transaction) {
    return transaction.income ? '+' : '-';
  }

  seedVerificationClicked($event) {
    $event.stopPropagation();
    this.router.navigate([this.router.url, { outlets: { popup: 'seed-verification-popup' }}]);
  }

  closeVerificationMessage() {
    this.store.dispatch(updateVerificatedSetting({settingValue: {
      state: this.verificatedSetting.state,
      isMessageClosed: true,
      balanceWasPositive: this.verificatedSetting.balanceWasPositive,
      balanceWasPositiveMoreEn: this.verificatedSetting.balanceWasPositiveMoreEn
    }}));
    this.dataService.saveWalletOptions();
    this.componentSettings.isValidationVisible = false;
  }

  closeGetCoinsMessage() {
    this.componentSettings.isGetCoinsVisible = false;
    this.dataService.getCoinsState.putState(true);
  }

  getCoinsClicked() {
    window.open('https://faucet.beamprivacy.community', '_blank');
  }
}

