import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { environment } from '@environment';
import { Router } from '@angular/router';
import { routes, transactionsStatuses, TableTypes } from '@consts';
import { Store, select } from '@ngrx/store';
import { selectAddress } from '../../../../store/selectors/address.selectors';
import { Observable } from 'rxjs';
import {
  selectPrivacySetting
} from '../../../../store/selectors/wallet-state.selectors';

@Component({
  selector: 'app-transaction-element',
  templateUrl: './transaction-element.component.html',
  styleUrls: ['./transaction-element.component.scss']
})
export class TransactionElementComponent implements OnInit {
  @Input() transaction: any;
  tableTypesConsts = TableTypes;
  privacySetting$: Observable<any>;
  privacyMode = false;

  private baseImgPath = `${environment.assetsPath}/images/statuses/`;
  private iconExpired = this.baseImgPath + `icon-expired.svg`;
  private iconReceiveCanceled = this.baseImgPath + `icon-receive-canceled.svg`;
  private iconReceived = this.baseImgPath + `icon-received.svg`;
  private iconReceiveFailed = this.baseImgPath + `icon-receive-failed.svg`;
  private iconReceiving = this.baseImgPath + `icon-receiving.svg`;
  private iconSendCanceled = this.baseImgPath + `icon-send-canceled.svg`;
  private iconSendFailed = this.baseImgPath + `icon-send-failed.svg`;
  private iconSending = this.baseImgPath + `icon-sending.svg`;
  private iconSendingOwn = this.baseImgPath + `icon-sending-own.svg`;
  private iconSent = this.baseImgPath + `icon-sent.svg`;
  private iconSentOwn = this.baseImgPath + `icon-sent-own.svg`;
  private iconComment = `${environment.assetsPath}/images/modules/addresses/components/address-element/icon-comment.svg`;

  constructor(
    public router: Router,
    private store: Store<any>,
  ) {
    this.privacySetting$ = this.store.pipe(select(selectPrivacySetting));
    this.privacySetting$.subscribe((state) => {
      this.privacyMode = state;
    });
  }

  getStatus(item) {
    let status = item.status_string;
    if (item.status_string === transactionsStatuses.SELF_SENDING) {
      status = transactionsStatuses.SENDING_TO_OWN_ADDRESS;
    } else if (item.status_string === transactionsStatuses.COMPLETED) {
      const address$ = this.store.pipe(select(selectAddress(item.receiver)));
      address$.subscribe(val => {
        if (val !== undefined && val.own) {
          status = transactionsStatuses.SENT_TO_OWN_ADDRESS;
        }
      });
    }

    return status;
  }

  getTrIcon() {
    let iconPath = '';
    if (this.transaction.status_string === transactionsStatuses.CANCELED && this.transaction.income) {
      iconPath = this.iconReceiveCanceled;
    } else if (this.transaction.status_string === transactionsStatuses.CANCELED && !this.transaction.income) {
      iconPath = this.iconSendCanceled;
    } else if (this.transaction.status_string === transactionsStatuses.EXPIRED) {
      iconPath = this.iconExpired;
    } else if (this.transaction.status_string === transactionsStatuses.FAILED && this.transaction.income) {
      iconPath = this.iconReceiveFailed;
    } else if (this.transaction.status_string === transactionsStatuses.FAILED && !this.transaction.income) {
      iconPath = this.iconSendFailed;
    } else if ((this.transaction.status_string === transactionsStatuses.PENDING ||
        this.transaction.status_string === transactionsStatuses.IN_PROGRESS ||
        this.transaction.status_string === transactionsStatuses.RECEIVING ||
        this.transaction.status_string === transactionsStatuses.WAITING_FOR_RECEIVER ||
        this.transaction.status_string === transactionsStatuses.WAITING_FOR_SENDER) && this.transaction.income) {
      iconPath = this.iconReceiving;
    } else if ((this.transaction.status_string === transactionsStatuses.PENDING ||
        this.transaction.status_string === transactionsStatuses.SENDING ||
        this.transaction.status_string === transactionsStatuses.IN_PROGRESS ||
        this.transaction.status_string === transactionsStatuses.WAITING_FOR_RECEIVER ||
        this.transaction.status_string === transactionsStatuses.WAITING_FOR_SENDER) && !this.transaction.income) {
      iconPath = this.iconSending;
    } else if (this.transaction.status_string === transactionsStatuses.RECEIVED) {
      iconPath = this.iconReceived;
    } else if (this.transaction.status_string === transactionsStatuses.SENT) {
      iconPath = this.iconSent;
    }

    if (this.transaction.status_string === transactionsStatuses.SELF_SENDING) {
      iconPath = this.iconSendingOwn;
    } else if (this.transaction.status_string === transactionsStatuses.COMPLETED) {
      const address$ = this.store.pipe(select(selectAddress(this.transaction.receiver)));
      address$.subscribe(val => {
        if (val !== undefined && val.own) {
          iconPath = this.iconSentOwn;
        }
      });
    }
    return iconPath;
  }

  isActionsVisible() {
    return this.transaction.status_string === transactionsStatuses.SENT;
  }

  getValueSign() {
    return this.transaction.income ? '+' : '-';
  }

  getContentClass() {
    let className = '';
    if (this.transaction.status_string === transactionsStatuses.CANCELED ||
        this.transaction.status_string === transactionsStatuses.EXPIRED) {
      className = 'canceled';
    } else if (this.transaction.status_string === transactionsStatuses.FAILED) {
      className = 'failed';
    } else if ((this.transaction.status_string === transactionsStatuses.PENDING ||
        this.transaction.status_string === transactionsStatuses.IN_PROGRESS ||
        this.transaction.status_string === transactionsStatuses.COMPLETED ||
        this.transaction.status_string === transactionsStatuses.SENDING ||
        this.transaction.status_string === transactionsStatuses.WAITING_FOR_SENDER ||
        this.transaction.status_string === transactionsStatuses.WAITING_FOR_RECEIVER ||
        this.transaction.status_string === transactionsStatuses.SENT) && !this.transaction.income) {
      className = 'send';
    } else if ((this.transaction.status_string === transactionsStatuses.PENDING ||
        this.transaction.status_string === transactionsStatuses.IN_PROGRESS ||
        this.transaction.status_string === transactionsStatuses.RECEIVING ||
        this.transaction.status_string === transactionsStatuses.COMPLETED ||
        this.transaction.status_string === transactionsStatuses.WAITING_FOR_SENDER ||
        this.transaction.status_string === transactionsStatuses.WAITING_FOR_RECEIVER ||
        this.transaction.status_string === transactionsStatuses.RECEIVED) && this.transaction.income) {
      className = 'receive';
    }

    if (this.transaction.status_string === transactionsStatuses.SELF_SENDING) {
      className = 'own';
    } else if (this.transaction.status_string === transactionsStatuses.COMPLETED) {
      const address$ = this.store.pipe(select(selectAddress(this.transaction.receiver)));
      address$.subscribe(val => {
        if (val !== undefined && val.own) {
          className = 'own';
        }
      });
    }
    return className;
  }

  isCommentDefault(comment) {
    return comment === 'default';
  }

  itemSelected(transactionData) {
  }

  transactionClicked() {
    this.router.navigate([routes.TRANSACTION_DETAILS_ROUTE, this.transaction.txId]);
  }

  ngOnInit() {
  }
}
