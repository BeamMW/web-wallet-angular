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

  isActionsVisible() {
    return this.transaction.status_string === transactionsStatuses.SENT;
  }

  getValueSign() {
    return this.transaction.income ? '+' : '-';
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
