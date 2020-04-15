import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { selectTrByAddress, selectTrsById } from '../../../store/selectors/transaction.selectors';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { environment } from '@environment';

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss']
})
export class TransactionListComponent implements OnInit, OnChanges {
  @Input() address: any;
  @Input() txId: any;

  emptyIcon = `${environment.assetsPath}/images/shared/components/table/transactions-empty-state.svg`;

  transactions$: Observable<any>;

  constructor(public store: Store<any>) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.address) {
      this.transactions$ = this.store.pipe(select(selectTrByAddress(changes.address.currentValue)));
    }

    if (changes.txId) {
      this.transactions$ = this.store.pipe(select(selectTrsById(changes.txId.currentValue)));
    }
  }

  ngOnInit() {}
}
