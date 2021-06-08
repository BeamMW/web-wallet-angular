import { Component, OnInit, Input } from '@angular/core';
import { transactionsStatuses } from '@consts';
import { environment } from '@environment';
import { Store, select } from '@ngrx/store';
//import { selectAddress } from '../../../store/selectors/address.selectors';

@Component({
  selector: 'app-status-icon',
  templateUrl: './status-icon.component.html',
  styleUrls: ['./status-icon.component.scss']
})
export class StatusIconComponent implements OnInit {
  @Input() transaction;

  private baseImgPath = `${environment.assetsPath}/images/statuses/`;
  private icons = {
    iconFailed: this.baseImgPath + `icon-failed.svg`,
    iconReceived: this.baseImgPath + `icon-received.svg`,
    iconSent: this.baseImgPath + `icon-sent.svg`,  
    iconExpired: this.baseImgPath + `icon-expired.svg`,
    iconCanceledIncome: this.baseImgPath + `icon-canceled-income.svg`,
    iconCanceledOutcome: this.baseImgPath + `icon-canceled-outcome.svg`,
    iconInProgressIncome: this.baseImgPath + `icon-in-progress-income.svg`,
    iconInProgressOutcome: this.baseImgPath + `icon-in-progress-outcome.svg`,
    
    iconSentOwn: this.baseImgPath + `icon-sent-own.svg`,
    iconInProgressOwn: this.baseImgPath + `icon-in-progress-own.svg`,
  

    iconCanceledMaxOfflineOutcome: this.baseImgPath + `icon-canceled-max-offline-outcome.svg`,
    iconCanceledMaxOfflineIncome: this.baseImgPath + `icon-canceled-max-offline-income.svg`,
    iconInProgressMaxOfflineIncome: this.baseImgPath + `icon-in-progress-max-offline-income.svg`,
    iconInProgressMaxOfflineOutcome: this.baseImgPath + `icon-in-progress-max-offline-outcome.svg`,

    iconSentMaxOnline: this.baseImgPath + `icon-sent-max-online.svg`,
    iconInProgressMaxOnlineIncome: this.baseImgPath + `icon-in-progress-max-online-income.svg`,
    iconInProgressMaxOnlineOutcome: this.baseImgPath + `icon-in-progress-max-online-outcome.svg`,
  };

  constructor(
    private store: Store<any>
  ) { }

  ngOnInit() {
  }

  getTrIcon() {
    let iconPath = '';
    const status = this.transaction.status_string;
    if (status === transactionsStatuses.PENDING ||
      status === transactionsStatuses.IN_PROGRESS ||
      status === transactionsStatuses.WAITING_FOR_RECEIVER ||
      status === transactionsStatuses.WAITING_FOR_SENDER) {
      iconPath = this.transaction.income ? this.icons.iconInProgressIncome : this.icons.iconInProgressOutcome;
    } else if (status === transactionsStatuses.RECEIVED) {
      iconPath = this.icons.iconReceived;
    } else if (status === transactionsStatuses.SENT) {
      iconPath = this.icons.iconSent;
    } else if (status === transactionsStatuses.FAILED) {
      iconPath = this.icons.iconFailed;
    } else if (status === transactionsStatuses.EXPIRED) {
      iconPath = this.icons.iconExpired;
    } else if (status === transactionsStatuses.SENDING_TO_OWN_ADDRESS) {
      iconPath = this.icons.iconInProgressOwn;
    } else if (status === transactionsStatuses.SENT_TO_OWN_ADDRESS || status === transactionsStatuses.COMPLETED) {
      iconPath = this.icons.iconSentOwn;
    } else if (status === transactionsStatuses.CANCELED) {
      iconPath = this.transaction.income ? this.icons.iconCanceledIncome : this.icons.iconCanceledOutcome;
    }
    // else if (this.transaction.status_string === transactionsStatuses.CANCELED && this.transaction.income) {
    //   iconPath = this.icons.iconReceiveCanceled;
    // } else if (this.transaction.status_string === transactionsStatuses.CANCELED && !this.transaction.income) {
    //   iconPath = this.iconSendCanceled;
    // } else if (this.transaction.status_string === transactionsStatuses.EXPIRED) {
    //   iconPath = this.iconExpired;
    // } else if (this.transaction.status_string === transactionsStatuses.FAILED && this.transaction.income) {
    //   iconPath = this.iconReceiveFailed;
    // } else if (this.transaction.status_string === transactionsStatuses.FAILED && !this.transaction.income) {
    //   iconPath = this.iconSendFailed;
    // } else if () {
    //   
    // } else if (this.transaction.status_string === transactionsStatuses.SENT) {
    //   iconPath = this.iconSent;
    // } else if (this.transaction.status_string === transactionsStatuses.COMPLETED) {
      // const address$ = this.store.pipe(select(selectAddress(this.transaction.receiver)));
      // address$.subscribe(val => {
      //   if (val !== undefined && val.own) {
      //     iconPath = this.iconSentOwn;
      //   }
      // });
    //}
    return iconPath;
  }

}
