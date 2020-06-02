import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { WasmService } from './../../../../wasm.service';
import { Subscription, Observable, from } from 'rxjs';
import { Store, select } from '@ngrx/store';
import {
  updatePrivacySetting
} from './../../../../store/actions/wallet.actions';
import { selectAllAddresses } from '../../../../store/selectors/address.selectors';
import { selectAllUtxo } from '../../../../store/selectors/utxo.selectors';
import {
  selectAllTr,
  selectInProgressTr,
  selectReceivedTr,
  selectSentTr
} from '../../../../store/selectors/transaction.selectors';
import {
  selectPrivacySetting,
  selectVerificatedSetting,
  selectWalletStatus
} from '../../../../store/selectors/wallet-state.selectors';
import { selectAddress } from '../../../../store/selectors/address.selectors';
import { DataService, WindowService, WebsocketService, LoginService } from './../../../../services';
import { routes, transactionsStatuses } from '@consts';

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
  public iconBeam: string = `${environment.assetsPath}/images/modules/wallet/containers/main/ic-beam.svg`;
  public iconBeamFull: string = `${environment.assetsPath}/images/modules/wallet/containers/main/icon-beam-full.svg`;
  public iconReceived: string = `${environment.assetsPath}/images/modules/wallet/containers/main/icon-received.svg`;
  public iconSent: string = `${environment.assetsPath}/images/modules/wallet/containers/main/icon-sent.svg`;
  public iconMenu: string = `${environment.assetsPath}/images/modules/wallet/containers/main/icon-menu.svg`;
  public iconEmpty: string = `${environment.assetsPath}/images/modules/wallet/containers/main/atomic-empty-state.svg`;
  public iconDisabledPrivacy: string = `${environment.assetsPath}/images/modules/wallet/containers/main/icn-eye.svg`;
  public iconEnabledPrivacy: string = `${environment.assetsPath}/images/modules/wallet/containers/main/icn-eye-crossed.svg`;
  public iconEnabledPrivacyGrayed: string = `${environment.assetsPath}/images/modules/wallet/containers/main/icn-eye-crossed-gray.svg`;

  private iconComment = `${environment.assetsPath}/images/modules/addresses/components/address-element/icon-comment.svg`;


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

  constructor(private store: Store<any>,
              private wasm: WasmService,
              public router: Router,
              private windowService: WindowService,
              private websocketService: WebsocketService,
              private loginService: LoginService,
              private dataService: DataService) {
    this.isFullScreen = windowService.isFullSize();
    this.addresses$ = this.store.pipe(select(selectAllAddresses));
    this.utxos$ = this.store.pipe(select(selectAllUtxo));
    this.transactions$ = this.store.pipe(select(selectAllTr));
    this.privacySetting$ = this.store.pipe(select(selectPrivacySetting));
    this.verificatedSetting$ = this.store.pipe(select(selectVerificatedSetting));

    this.verificatedSetting$.subscribe((state) => {
      this.verificatedSetting = state;
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

    this.walletStatus$ = this.store.pipe(select(selectWalletStatus));
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
}

