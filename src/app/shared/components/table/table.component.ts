import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { transactionsStatuses, TableTypes, utxoStatuses, rpcMethodIdsConsts } from '@consts';
import { Observable, of } from 'rxjs';

import { environment } from '@environment';
import {Router} from '@angular/router';

import { Store, select } from '@ngrx/store';
import { 
  selectContact 
} from '@app/store/selectors/wallet-state.selectors';
import { selectUtxoById } from '@app/store/selectors/utxo.selectors';
import { WasmService, DataService } from '@app/services';
import { Subscription } from 'rxjs';
import { ObservableInput } from "ngx-observable-input";
import { saveProofData } from '@app/store/actions/wallet.actions';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class TableComponent implements OnInit, OnChanges {
  @ObservableInput() @Input("tableData") public tableData$: Observable<any>;
  //@Input() tableData: any;
  @Input() tableColumns: any;
  @Input() tableType: any;
  @Input() privacy = false;

  isReversedSort = false;
  contact$: Observable<any>;
  utxoList$: Observable<any>;
  assets$: Observable<any>;
  tableTypesConsts = TableTypes;
  public utxoStatusesConsts = utxoStatuses;
  public iconEnabledPrivacy: string = `${environment.assetsPath}/images/modules/wallet/containers/main/icn-eye-crossed-gray.svg`;

  isUtxoListVisible = true;
  tableTypes = TableTypes;
  sub: Subscription;
  proofValue = '';

  sortParams = {
    created: 'create_time',
    from: 'sender',
    to: 'receiver',
    amount: 'value',
    status: 'status_string',
    address: 'address',
    name: 'comment',
    exp_date: 'create_time',
    contactName: 'name',
    maturity: 'maturity',
    utxo_amount: 'amount',
    utxo_type: 'type'
  };
  activeSortItem = null;

  public icons = {
    iconSort: `${environment.assetsPath}/images/shared/components/table/icon-sort.svg`,
    iconSortActive: `${environment.assetsPath}/images/shared/components/table/icon-sort-active.svg`,
    contactIcon: `${environment.assetsPath}/images/shared/components/table/icon-contact.svg`,
    arrowIcon: `${environment.assetsPath}/images/shared/components/table/icon-arrow.svg`,
    sentIcon: `${environment.assetsPath}/images/shared/components/table/icon-sent.svg`,
    receivedIcon: `${environment.assetsPath}/images/shared/components/table/icon-received.svg`
  }

  dataSource: any;

  isExpansionDetailRow = (i: number, row: Object) => row.hasOwnProperty('detailRow');
  expandedElement: any = null;

  constructor(
    private store: Store<any>,
    private router: Router,
    private wasmService: WasmService,
    private dataService: DataService
  ) {}

  getExpandedState(data) {
    let expState = 'collapsed';
    if ((this.tableType === TableTypes.TRANSACTIONS && data.txId === this.expandedElement.txId) ||
        (this.tableType === TableTypes.UTXO && data.id === this.expandedElement.id) ||
        (this.tableType === TableTypes.ADDRESSES && data.address === this.expandedElement.address)) {
      expState = 'expanded';
    }

    return expState;
  }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (this.activeSortItem === null) {
      this.activeSortItem = this.tableType === TableTypes.TRANSACTIONS ? this.sortParams.created : null;
    }

    let updatedData = changes.tableData$.currentValue;
    if (updatedData) {
      if (this.expandedElement === null && this.tableType === TableTypes.TRANSACTIONS) {
        this.expandedElement = {txId: null};
      } else if (this.expandedElement === null && this.tableType === TableTypes.UTXO) {
        this.expandedElement = {id: null};
      } else if (this.expandedElement === null && this.tableType === TableTypes.ADDRESSES) {
        this.expandedElement = {address: null};
      }

      if (this.activeSortItem !== null) {
        this.isReversedSort = !this.isReversedSort;
        updatedData = this.getSortedDataSource(this.activeSortItem, updatedData);
      }

      this.dataSource = new ExampleDataSource(updatedData);
    }
  }

  expandElement(row) {
    if (this.expandedElement.txId !== null && this.expandedElement === row) {
      if (this.tableType === TableTypes.TRANSACTIONS) {
        this.expandedElement = {txId: null};
      } else if (this.tableType === TableTypes.UTXO) {
        this.expandedElement = {id: null};
      } else if (this.tableType === TableTypes.ADDRESSES) {
        this.expandedElement = {address: null};
      }
    } else {
      this.expandedElement = row;
      if (this.tableType === TableTypes.TRANSACTIONS) {
        this.contact$ = row.income ? this.store.pipe(select(selectContact(row.sender))) :
          this.store.pipe(select(selectContact(row.receiver)));
        if (row.status_string === 'sent') {
          this.utxoList$ = this.store.pipe(select(selectUtxoById(row.txId)));
          this.loadPaymentProof(row);
        }
      }
    }
    this.isUtxoListVisible = true;
  }

  getItemSrc(item) {
    // return item.path === this.router.url ? item.srcOn : (item.src || item.srcOut);
  }

  utxoListHeaderClicked($event) {
    $event.stopPropagation();
    this.isUtxoListVisible = !this.isUtxoListVisible;
  }

  getSortedDataSource(sortBy, value) {
    const sortedData = value.sort((a, b) => {
      if (a[sortBy] > b[sortBy]) {
        return 1; }
      if (a[sortBy] < b[sortBy]) {
        return -1; }
      return 0;
    });

    if (this.isReversedSort) {
      sortedData.reverse();
      this.isReversedSort = false;
    } else {
      this.isReversedSort = true;
    }

    return sortedData;
  }

  sortClicked(sortBy) {
    this.isReversedSort = this.activeSortItem === sortBy && this.isReversedSort;
    this.activeSortItem = sortBy;
    const sortedSource = this.getSortedDataSource(sortBy, this.dataSource.DataArray);

    this.dataSource = new ExampleDataSource(sortedSource);
  }

  proofDetailsClicked($event) {
    $event.stopPropagation();
    this.router.navigate([this.router.url, { outlets: { popup: 'payment-proof-exported' }}]);
  }

  private loadPaymentProof(transaction) {
    this.sub = this.wasmService.wallet.subscribe((r)=> {
      const respone = JSON.parse(r);

      if (respone.id === rpcMethodIdsConsts.EXPORT_PAYMENT_PROOF_ID) {
        if (respone.result && respone.result.payment_proof) {
          this.proofValue = respone.result.payment_proof;
          this.store.dispatch(saveProofData({proofData: {
            sender: transaction.sender,
            receiver: transaction.receiver,
            amount: transaction.value,
            kernelId: transaction.kernel,
            code: respone.result.payment_proof
          }}));
        }
        //this.sub.unsubscribe();
      }
    });

    this.dataService.exportPaymentProof(transaction.txId);
  }

  proofDataToCp() {
    return this.proofValue;
  }

  isActionsVisible(item) {
    return item.status_string === transactionsStatuses.SENT;
  }

  getValueSign(element) {
    return element.income ? '+' : '-';
  }
}

export class ExampleDataSource extends DataSource<any> {
  constructor(private DataArray: any[]) {
    super();
  }

  connect(): Observable<any[]> {
    const rows = [];
    this.DataArray.forEach(element => rows.push(element, { detailRow: true, element }));
    return of(rows);
  }
  disconnect() {}
}
