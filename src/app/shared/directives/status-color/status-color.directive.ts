import { Directive, OnInit, Input, ElementRef, HostBinding } from '@angular/core';
import { transactionsStatuses, statusesColors } from '@consts';
import { Store, select } from '@ngrx/store';
//import { selectAddress } from '../../../store/selectors/address.selectors';

@Directive({
  selector: '[appStatusColor]'
})
export class StatusColorDirective implements OnInit {
  @Input('appStatusColorTransaction') transaction: any;
  @Input('appCircleColorTransaction') transactionFromCicrle: any;

  constructor(
    private store: Store<any>,
    private el: ElementRef
  ) { }

  ngOnInit() {
    if (this.transaction !== undefined) {
      this.el.nativeElement.style.color = this.getColor(this.transaction);
    } else if (this.transactionFromCicrle !== undefined) {
      this.el.nativeElement.style.border = 'solid 1px ' + this.getColor(this.transactionFromCicrle);
    }
  }

  getColor(transaction) {
    let color = '';
    const status = transaction.status_string;
    if (status === transactionsStatuses.PENDING ||
      status === transactionsStatuses.IN_PROGRESS ||
      status === transactionsStatuses.IN_PROGRESS_MAX_PRIVACY ||
      status === transactionsStatuses.IN_PROGRESS_OFFLINE ) {
        color = this.transaction.income ? statusesColors.RECEIVE : statusesColors.SEND;
    } else if (status === transactionsStatuses.WAITING_FOR_RECEIVER ||
      status === transactionsStatuses.SENT ||
      status === transactionsStatuses.SENDING ||
      status === transactionsStatuses.SENT_MAX_PRIVACY ||
      status === transactionsStatuses.SENT_OFFLINE) {
        color = statusesColors.SEND;
    } else if (status === transactionsStatuses.WAITING_FOR_SENDER ||
      status === transactionsStatuses.RECEIVED ||
      status === transactionsStatuses.RECEIVING ||
      status === transactionsStatuses.RECEIVED_MAX_PRIVACY ||
      status === transactionsStatuses.RECEIVED_OFFLINE) {
        color = statusesColors.RECEIVE;
    } else if (status === transactionsStatuses.SENT_TO_OWN_ADDRESS ||
      status === transactionsStatuses.SENDING_TO_OWN_ADDRESS) {
        color = statusesColors.SELF_SENDING;
    } else if (status === transactionsStatuses.FAILED ||
      status === transactionsStatuses.FAILED_MAX_PRIVACY ||
      status === transactionsStatuses.FAILED_OFFLINE) {
        color = statusesColors.FAILED;
    } else if (status === transactionsStatuses.CANCELED ||
      status === transactionsStatuses.CANCELED_MAX_PRIVACY ||
      status === transactionsStatuses.CANCELED_OFFLINE) {
        color = statusesColors.CANCELED;
    }

    return color;
  }
}
