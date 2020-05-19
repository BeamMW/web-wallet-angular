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

  private baseImgPath = `${environment.assetsPath}/images/statuses/`;
  private iconExpired = this.baseImgPath + `icon-expired.svg`;
  private iconReceiveCanceled = this.baseImgPath + `icon-receive-canceled.svg`;
  private iconReceiveFailed = this.baseImgPath + `icon-receive-failed.svg`;
  private iconReceiving = this.baseImgPath + `icon-receiving.svg`;
  private iconSendCanceled = this.baseImgPath + `icon-send-canceled.svg`;
  private iconSendFailed = this.baseImgPath + `icon-send-failed.svg`;
  private iconSending = this.baseImgPath + `icon-sending.svg`;
  private iconSendingOwn = this.baseImgPath + `icon-sending-own.svg`;
  private iconSentOwn = this.baseImgPath + `icon-sent-own.svg`;
  private iconComment = `${environment.assetsPath}/images/modules/addresses/components/address-element/icon-comment.svg`;


  public sendRoute = '/send/addresses';
  public receiveRoute = '/receive/page';
  public tableType = 'wallet';
  public tableColumns = ['created', 'from', 'to', 'amount', 'status', 'actions'];

  selectorTitlesData = selectorTitles;
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

  getTrIcon(transaction) {
    let iconPath = '';
    if (transaction.status_string === transactionsStatuses.CANCELED && transaction.income) {
      iconPath = this.iconReceiveCanceled;
    } else if (transaction.status_string === transactionsStatuses.CANCELED && !transaction.income) {
      iconPath = this.iconSendCanceled;
    } else if (transaction.status_string === transactionsStatuses.EXPIRED) {
      iconPath = this.iconExpired;
    } else if (transaction.status_string === transactionsStatuses.FAILED && transaction.income) {
      iconPath = this.iconReceiveFailed;
    } else if (transaction.status_string === transactionsStatuses.FAILED && !transaction.income) {
      iconPath = this.iconSendFailed;
    } else if ((transaction.status_string === transactionsStatuses.PENDING ||
        transaction.status_string === transactionsStatuses.IN_PROGRESS ||
        transaction.status_string === transactionsStatuses.RECEIVING ||
        transaction.status_string === transactionsStatuses.WAITING_FOR_RECEIVER) && transaction.income) {
      iconPath = this.iconReceiving;
    } else if ((transaction.status_string === transactionsStatuses.PENDING ||
        transaction.status_string === transactionsStatuses.SENDING ||
        transaction.status_string === transactionsStatuses.IN_PROGRESS ||
        transaction.status_string === transactionsStatuses.WAITING_FOR_SENDER) && !transaction.income) {
      iconPath = this.iconSending;
    } else if (transaction.status_string === transactionsStatuses.RECEIVED) {
      iconPath = this.iconReceived;
    } else if (transaction.status_string === transactionsStatuses.SENT) {
      iconPath = this.iconSent;
    }

    if (transaction.status_string === transactionsStatuses.SELF_SENDING) {
      iconPath = this.iconSendingOwn;
    } else if (transaction.status_string === transactionsStatuses.COMPLETED) {
      const address$ = this.store.pipe(select(selectAddress(transaction.receiver)));
      address$.subscribe(val => {
        if (val !== undefined && val.own) {
          iconPath = this.iconSentOwn;
        }
      });
    }
    return iconPath;
  }

  getContentClass(transaction) {
    let className = '';
    if (transaction.status_string === transactionsStatuses.CANCELED ||
        transaction.status_string === transactionsStatuses.EXPIRED) {
      className = 'canceled';
    } else if (transaction.status_string === transactionsStatuses.FAILED) {
      className = 'failed';
    } else if ((transaction.status_string === transactionsStatuses.PENDING ||
        transaction.status_string === transactionsStatuses.IN_PROGRESS ||
        transaction.status_string === transactionsStatuses.COMPLETED ||
        transaction.status_string === transactionsStatuses.SENDING ||
        transaction.status_string === transactionsStatuses.WAITING_FOR_RECEIVER ||
        transaction.status_string === transactionsStatuses.SENT) && !transaction.income) {
      className = 'send';
    } else if ((transaction.status_string === transactionsStatuses.PENDING ||
        transaction.status_string === transactionsStatuses.IN_PROGRESS ||
        transaction.status_string === transactionsStatuses.RECEIVING ||
        transaction.status_string === transactionsStatuses.COMPLETED ||
        transaction.status_string === transactionsStatuses.WAITING_FOR_SENDER ||
        transaction.status_string === transactionsStatuses.RECEIVED) && transaction.income) {
      className = 'receive';
    }

    if (transaction.status_string === transactionsStatuses.SELF_SENDING) {
      className = 'own';
    } else if (transaction.status_string === transactionsStatuses.COMPLETED) {
      const address$ = this.store.pipe(select(selectAddress(transaction.receiver)));
      address$.subscribe(val => {
        if (val !== undefined && val.own) {
          className = 'own';
        }
      });
    }
    return className;
  }
}

