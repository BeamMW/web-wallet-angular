import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef, ViewChild } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatTable } from '@angular/material';
import { routes, transactionsStatuses, TableTypes } from '@consts';

import { Observable, BehaviorSubject, of } from 'rxjs';

import { environment } from '@environment';
import {Router} from '@angular/router';

import { Store, select } from '@ngrx/store';
import { selectContact } from '../../../store/selectors/wallet-state.selectors';
import { selectUtxoById } from '../../../store/selectors/utxo.selectors';
import { selectAddress } from '../../../store/selectors/address.selectors';

import { WebsocketService } from './../../../services';
import { Subscription } from 'rxjs';
import { WasmService } from './../../../wasm.service';

import {
  saveProofData
} from './../../../store/actions/wallet.actions';

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
  @Input() tableData: any;
  @Input() tableColumns: any;
  @Input() tableType: any;
  @Input() privacy = false;

  isReversedSort = false;
  contact$: Observable<any>;
  utxoList$: Observable<any>;
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
  private iconSentOwn = this.baseImgPath + `icon-sent-own.svg`;
  private iconSent = this.baseImgPath + `icon-sent.svg`;
  public iconEnabledPrivacy: string = `${environment.assetsPath}/images/modules/wallet/containers/main/icn-eye-crossed-gray.svg`;

  isUtxoListVisible = true;
  tableTypes = TableTypes;
  sub: Subscription;
  proofValue = '';

  //exampleDatabase = new ExampleDatabase();
  //@ViewChild(MatTable, {static: true}) table: MatTable<any>;

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

  public iconSort: string = `${environment.assetsPath}/images/shared/components/table/icon-sort.svg`;
  public iconSortActive: string = `${environment.assetsPath}/images/shared/components/table/icon-sort-active.svg`;
  public contactIcon: string = `${environment.assetsPath}/images/shared/components/table/icon-contact.svg`;
  public arrowIcon: string = `${environment.assetsPath}/images/shared/components/table/icon-arrow.svg`;
  public sentIcon: string = `${environment.assetsPath}/images/shared/components/table/icon-sent.svg`;
  public receivedIcon: string = `${environment.assetsPath}/images/shared/components/table/icon-received.svg`;

  dataSource: any;

  isExpansionDetailRow = (i: number, row: Object) => row.hasOwnProperty('detailRow');
  expandedElement: any = null;

  constructor(
    private store: Store<any>,
    private router: Router,
    private websocketService: WebsocketService,
    private changeDetectorRefs: ChangeDetectorRef,
    private wasmService: WasmService
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

    if (changes.tableData) {
      if (this.expandedElement === null && this.tableType === TableTypes.TRANSACTIONS) {
        this.expandedElement = {txId: null};
      } else if (this.expandedElement === null && this.tableType === TableTypes.UTXO) {
        this.expandedElement = {id: null};
      } else if (this.expandedElement === null && this.tableType === TableTypes.ADDRESSES) {
        this.expandedElement = {address: null};
      }

      let updatedData = changes.tableData.currentValue;
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
    this.sub = this.websocketService.on().subscribe((msg: any) => {
      if (msg.id === 4) {
        if (msg.result && msg.result.payment_proof) {
          this.proofValue = msg.result.payment_proof;
          this.store.dispatch(saveProofData({proofData: {
            sender: transaction.sender,
            receiver: transaction.receiver,
            amount: transaction.value,
            kernelId: transaction.kernel,
            code: msg.result.payment_proof
          }}));
        }
        this.sub.unsubscribe();
      }
    });

    this.websocketService.send({
      jsonrpc: '2.0',
      id: 4,
      method: 'export_payment_proof',
      params: {
        txId: transaction.txId
      }
    });
  }

  proofDataToCp() {
    return this.proofValue;
  }

  isActionsVisible(item) {
    return item.status_string === transactionsStatuses.SENT;
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

  getTrIcon(item) {
    let iconPath = '';
    if (item.status_string === transactionsStatuses.CANCELED && item.income) {
      iconPath = this.iconReceiveCanceled;
    } else if (item.status_string === transactionsStatuses.CANCELED && !item.income) {
      iconPath = this.iconSendCanceled;
    } else if (item.status_string === transactionsStatuses.EXPIRED) {
      iconPath = this.iconExpired;
    } else if (item.status_string === transactionsStatuses.FAILED && item.income) {
      iconPath = this.iconReceiveFailed;
    } else if (item.status_string === transactionsStatuses.FAILED && !item.income) {
      iconPath = this.iconSendFailed;
    } else if ((item.status_string === transactionsStatuses.PENDING ||
        item.status_string === transactionsStatuses.IN_PROGRESS ||
        item.status_string === transactionsStatuses.RECEIVING ||
        item.status_string === transactionsStatuses.WAITING_FOR_SENDER) && item.income) {
      iconPath = this.iconReceiving;
    } else if ((item.status_string === transactionsStatuses.SENDING ||
        item.status_string === transactionsStatuses.PENDING ||
        item.status_string === transactionsStatuses.IN_PROGRESS ||
        item.status_string === transactionsStatuses.WAITING_FOR_RECEIVER) && !item.income) {
      iconPath = this.iconSending;
    } else if (item.status_string === transactionsStatuses.RECEIVED) {
      iconPath = this.iconReceived;
    } else if (item.status_string === transactionsStatuses.SENT) {
      iconPath = this.iconSent;
    }

    if (item.status_string === transactionsStatuses.SELF_SENDING) {
      iconPath = this.iconSendingOwn;
    } else if (item.status_string === transactionsStatuses.COMPLETED) {
      const address$ = this.store.pipe(select(selectAddress(item.receiver)));
      address$.subscribe(val => {
        if (val !== undefined && val.own) {
          iconPath = this.iconSentOwn;
        }
      });
    }

    return iconPath;
  }

  getContentClass(item) {
    let className = '';
    if (item.status_string === transactionsStatuses.CANCELED ||
        item.status_string === transactionsStatuses.EXPIRED) {
      className = 'canceled';
    } else if (item.status_string === transactionsStatuses.FAILED) {
      className = 'failed';
    } else if ((item.status_string === transactionsStatuses.PENDING ||
        item.status_string === transactionsStatuses.IN_PROGRESS ||
        item.status_string === transactionsStatuses.COMPLETED ||
        item.status_string === transactionsStatuses.SENDING ||
        item.status_string === transactionsStatuses.WAITING_FOR_RECEIVER ||
        item.status_string === transactionsStatuses.SENT) && !item.income) {
      className = 'send';
    } else if ((item.status_string === transactionsStatuses.PENDING ||
        item.status_string === transactionsStatuses.IN_PROGRESS ||
        item.status_string === transactionsStatuses.RECEIVING ||
        item.status_string === transactionsStatuses.COMPLETED ||
        item.status_string === transactionsStatuses.WAITING_FOR_SENDER ||
        item.status_string === transactionsStatuses.RECEIVED) && item.income) {
      className = 'receive';
    }

    if (item.status_string === transactionsStatuses.SELF_SENDING) {
      className = 'own';
    } else if (item.status_string === transactionsStatuses.COMPLETED) {
      const address$ = this.store.pipe(select(selectAddress(item.receiver)));
      address$.subscribe(val => {
        if (val !== undefined && val.own) {
          className = 'own';
        }
      });
    }
    return className;
  }

  getValueSign(element) {
    return element.income ? '+' : '-';
  }

  // getToken(data) {
  //   return this.wasmService.getSendToken(data.sender, val.identity, 0);
  // }
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
