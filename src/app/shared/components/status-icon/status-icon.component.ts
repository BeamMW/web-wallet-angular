import { Component, OnInit, Input } from '@angular/core';
import { transactionsStatuses } from '@consts';
import { environment } from '@environment';

@Component({
  selector: 'app-status-icon',
  templateUrl: './status-icon.component.html',
  styleUrls: ['./status-icon.component.scss']
})
export class StatusIconComponent implements OnInit {
  @Input() transaction;

  private baseImgPath = `${environment.assetsPath}/images/statuses/`;
  private icons = {
    iconFailedIncome: this.baseImgPath + `icon-failed-income.svg`,
    iconFailedOutcome: this.baseImgPath + `icon-failed-outcome.svg`,
    iconReceived: this.baseImgPath + `icon-received.svg`,
    iconSent: this.baseImgPath + `icon-sent.svg`,  
    iconExpired: this.baseImgPath + `icon-expired.svg`,
    iconCanceledIncome: this.baseImgPath + `icon-canceled-income.svg`,
    iconCanceledOutcome: this.baseImgPath + `icon-canceled-outcome.svg`,
    iconInProgressIncome: this.baseImgPath + `icon-in-progress-income.svg`,
    iconInProgressOutcome: this.baseImgPath + `icon-in-progress-outcome.svg`,
    
    iconSentOwn: this.baseImgPath + `icon-sent-own.svg`,
    iconInProgressOwn: this.baseImgPath + `icon-in-progress-own.svg`,
    iconInProgressMaxOwn: this.baseImgPath + `icon-in-progress-max-privacy-own.svg`,
    iconInProgressOfflineOwn: this.baseImgPath + `icon-in-progress-offline-own.svg`,
    iconSentMaxOwn: this.baseImgPath + `icon-sent-max-privacy-own.svg`,
    iconSentOfflineOwn: this.baseImgPath + `icon-sent-offline-own.svg`,

    iconSentMaxOffline: this.baseImgPath + `icon-sent-max-offline.svg`,
    iconCanceledMaxOfflineOutcome: this.baseImgPath + `icon-canceled-max-offline-outcome.svg`,
    iconCanceledMaxOfflineIncome: this.baseImgPath + `icon-canceled-max-offline-income.svg`,
    iconInProgressMaxOfflineIncome: this.baseImgPath + `icon-in-progress-max-offline-income.svg`,
    iconInProgressMaxOfflineOutcome: this.baseImgPath + `icon-in-progress-max-offline-outcome.svg`,
    iconFailedMaxOfflineIncome: this.baseImgPath + `icon-failed-max-offline-income.svg`,
    iconFailedMaxOfflineOutcome: this.baseImgPath + `icon-failed-max-offline-outcome.svg`,
    iconReceivedMaxOffline: this.baseImgPath + `icon-received-max-privacy-offline.svg`,

    iconSentMaxOnline: this.baseImgPath + `icon-sent-max-online.svg`,
    iconInProgressMaxOnlineIncome: this.baseImgPath + `icon-in-progress-max-online-income.svg`,
    iconInProgressMaxOnlineOutcome: this.baseImgPath + `icon-in-progress-max-online-outcome.svg`,
    iconCanceledMaxOnlineIncome: this.baseImgPath + `icon-canceled-max-online-income.svg`,
    iconCanceledMaxOnlineOutcome: this.baseImgPath + `icon-canceled-max-online-outcome.svg`,
    iconFailedMaxOnlineIncome: this.baseImgPath + `icon-failed-max-online-income.svg`,
    iconFailedMaxOnlineOutcome: this.baseImgPath + `icon-failed-max-online-outcome.svg`,
    iconReceivedMaxOnline: this.baseImgPath + `icon-received-max-privacy-online.svg`, 
  };

  constructor() { }

  ngOnInit() {
  }

  getTrIcon() {
    let iconPath = '';
    const status = this.transaction.status_string;
    if (status === transactionsStatuses.PENDING ||
      status === transactionsStatuses.IN_PROGRESS ||
      status === transactionsStatuses.SENDING ||
      status === transactionsStatuses.RECEIVING ||
      status === transactionsStatuses.WAITING_FOR_RECEIVER ||
      status === transactionsStatuses.WAITING_FOR_SENDER) {
      iconPath = this.transaction.income ? this.icons.iconInProgressIncome : this.icons.iconInProgressOutcome;
    } else if (status === transactionsStatuses.RECEIVED) {
      iconPath = this.icons.iconReceived;
    } else if (status === transactionsStatuses.SENT) {
      iconPath = this.icons.iconSent;
    } else if (status === transactionsStatuses.FAILED) {
      iconPath = this.transaction.income ? this.icons.iconFailedIncome : this.icons.iconFailedOutcome;
    } else if (status === transactionsStatuses.EXPIRED) {
      iconPath = this.icons.iconExpired;
    } else if (status === transactionsStatuses.SENDING_TO_OWN_ADDRESS) {
      iconPath = this.icons.iconInProgressOwn;
    } else if (status === transactionsStatuses.SENT_TO_OWN_ADDRESS || status === transactionsStatuses.COMPLETED) {
      iconPath = this.icons.iconSentOwn;
    } else if (status === transactionsStatuses.CANCELED) {
      iconPath = this.transaction.income ? this.icons.iconCanceledIncome : this.icons.iconCanceledOutcome;
    } else if (status === transactionsStatuses.CANCELED_MAX_PRIVACY || 
        status === transactionsStatuses.CANCELED_PUBLIC_OFFLINE) {
      iconPath = this.transaction.income ? this.icons.iconCanceledMaxOnlineIncome 
        : this.icons.iconCanceledMaxOnlineOutcome;
    } else if (status === transactionsStatuses.FAILED_MAX_PRIVACY ||
        status === transactionsStatuses.FAILED_PUBLIC_OFFLINE) {
      iconPath = this.transaction.income ? this.icons.iconFailedMaxOnlineIncome 
        : this.icons.iconFailedMaxOnlineOutcome;
    } else if (status === transactionsStatuses.IN_PROGRESS_MAX_PRIVACY ||
        status === transactionsStatuses.IN_PROGRESS_PUBLIC_OFFLINE) {
      iconPath = this.transaction.income ? this.icons.iconInProgressMaxOnlineIncome 
        : this.icons.iconInProgressMaxOnlineOutcome;
    } else if (status === transactionsStatuses.SENT_MAX_PRIVACY ||
        status === transactionsStatuses.SENT_PUBLIC_OFFLINE) {
      iconPath = this.icons.iconSentMaxOnline;
    } else if (status === transactionsStatuses.CANCELED_OFFLINE) {
      iconPath = this.transaction.income ? this.icons.iconCanceledMaxOfflineIncome 
        : this.icons.iconCanceledMaxOfflineOutcome;
    } else if (status === transactionsStatuses.FAILED_OFFLINE) {
      iconPath = this.transaction.income ? this.icons.iconFailedMaxOfflineIncome 
        : this.icons.iconFailedMaxOfflineOutcome;
    } else if (status === transactionsStatuses.SENT_OFFLINE) {
      iconPath = this.icons.iconSentMaxOffline;
    } else if (status === transactionsStatuses.IN_PROGRESS_OFFLINE) {
      iconPath = this.transaction.income ? this.icons.iconInProgressMaxOfflineIncome 
        : this.icons.iconInProgressMaxOfflineOutcome;
    } else if (status === transactionsStatuses.SENT_OFFLINE) {
      iconPath = this.icons.iconSentMaxOffline;
    } 
     
    return iconPath;
  }

}
