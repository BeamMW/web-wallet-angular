import { Component, OnInit, Input } from '@angular/core';
import { transactionsStatuses } from '@consts';
import { environment } from '@environment';
import { Store, select } from '@ngrx/store';
import { selectAddress } from '../../../store/selectors/address.selectors';

@Component({
  selector: 'app-status-icon',
  templateUrl: './status-icon.component.html',
  styleUrls: ['./status-icon.component.scss']
})
export class StatusIconComponent implements OnInit {
  @Input() transaction;

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
  private iconReceived = this.baseImgPath + `icon-received.svg`;
  private iconSent = this.baseImgPath + `icon-sent.svg`;

  constructor(
    private store: Store<any>
  ) { }

  ngOnInit() {
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
        this.transaction.status_string === transactionsStatuses.WAITING_FOR_SENDER ||
        this.transaction.status_string === transactionsStatuses.WAITING_FOR_RECEIVER) && !this.transaction.income) {
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

}
