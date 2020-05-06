import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { environment } from '@environment';
import { Router } from '@angular/router';
import { routes, transactionsStatuses, TableTypes } from '@consts';

@Component({
  selector: 'app-transaction-element',
  templateUrl: './transaction-element.component.html',
  styleUrls: ['./transaction-element.component.scss']
})
export class TransactionElementComponent implements OnInit {
  @Input() transaction: any;
  tableTypesConsts = TableTypes;

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
  ) {
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
        this.transaction.status_string === transactionsStatuses.WAITING_FOR_RECEIVER) && this.transaction.income) {
      iconPath = this.iconReceiving;
    } else if ((this.transaction.status_string === transactionsStatuses.PENDING ||
        this.transaction.status_string === transactionsStatuses.SENDING ||
        this.transaction.status_string === transactionsStatuses.IN_PROGRESS ||
        this.transaction.status_string === transactionsStatuses.WAITING_FOR_SENDER) && !this.transaction.income) {
      iconPath = this.iconSending;
    } else if ((this.transaction.status_string === transactionsStatuses.RECEIVED) ||
        (this.transaction.status_string === transactionsStatuses.COMPLETED && this.transaction.income)) {
      iconPath = this.iconReceived;
    } else if ((this.transaction.status_string === transactionsStatuses.SENT) ||
        (this.transaction.status_string === transactionsStatuses.COMPLETED && !this.transaction.income)) {
      iconPath = this.iconSent;
    } else if (this.transaction.status_string === transactionsStatuses.SENDING_TO_OWN_ADDRESS) {
      iconPath = this.iconSendingOwn;
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
        this.transaction.status_string === transactionsStatuses.WAITING_FOR_RECEIVER ||
        this.transaction.status_string === transactionsStatuses.SENT) && !this.transaction.income) {
      className = 'send';
    } else if ((this.transaction.status_string === transactionsStatuses.PENDING ||
        this.transaction.status_string === transactionsStatuses.IN_PROGRESS ||
        this.transaction.status_string === transactionsStatuses.RECEIVING ||
        this.transaction.status_string === transactionsStatuses.COMPLETED ||
        this.transaction.status_string === transactionsStatuses.WAITING_FOR_SENDER ||
        this.transaction.status_string === transactionsStatuses.RECEIVED) && this.transaction.income) {
      className = 'receive';
    } else if (this.transaction.status_string === transactionsStatuses.SENDING_TO_OWN_ADDRESS) {
      className = 'own';
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
