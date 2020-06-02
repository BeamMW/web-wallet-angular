import { Directive, OnInit, Input, ElementRef, HostBinding } from '@angular/core';
import { transactionsStatuses, statusesColors } from '@consts';
import { Store, select } from '@ngrx/store';
import { selectAddress } from '../../../store/selectors/address.selectors';

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
    if (transaction.status_string === transactionsStatuses.CANCELED ||
      transaction.status_string === transactionsStatuses.EXPIRED) {
        color = statusesColors.CANCELED;
    } else if (transaction.status_string === transactionsStatuses.FAILED) {
        color = statusesColors.FAILED;
    } else if ((transaction.status_string === transactionsStatuses.PENDING ||
        transaction.status_string === transactionsStatuses.IN_PROGRESS ||
        transaction.status_string === transactionsStatuses.COMPLETED ||
        transaction.status_string === transactionsStatuses.SENDING ||
        transaction.status_string === transactionsStatuses.WAITING_FOR_SENDER ||
        transaction.status_string === transactionsStatuses.WAITING_FOR_RECEIVER ||
        transaction.status_string === transactionsStatuses.SENT) && !transaction.income) {
          color = statusesColors.SEND;
    } else if ((transaction.status_string === transactionsStatuses.PENDING ||
        transaction.status_string === transactionsStatuses.IN_PROGRESS ||
        transaction.status_string === transactionsStatuses.RECEIVING ||
        transaction.status_string === transactionsStatuses.COMPLETED ||
        transaction.status_string === transactionsStatuses.WAITING_FOR_SENDER ||
        transaction.status_string === transactionsStatuses.WAITING_FOR_RECEIVER ||
        transaction.status_string === transactionsStatuses.RECEIVED) && transaction.income) {
          color = statusesColors.RECEIVE;
    }

    if (transaction.status_string === transactionsStatuses.SELF_SENDING) {
      color = statusesColors.SELF_SENDING;
    } else if (transaction.status_string === transactionsStatuses.COMPLETED) {
      const address$ = this.store.pipe(select(selectAddress(transaction.receiver)));
      address$.subscribe(val => {
        if (val !== undefined && val.own) {
          color = statusesColors.SELF_SENDING;
        }
      }).unsubscribe();
    }

    return color;
  }
}
