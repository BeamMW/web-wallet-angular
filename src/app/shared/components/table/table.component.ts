import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef, ViewChild } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Observable, of } from 'rxjs';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatSort } from '@angular/material';

import { environment } from '@environment';

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
  activeSortItem = null;

  @ViewChild(MatSort, {static: false}) sort: MatSort;

  sortParams = {
    created: 'created',
    from: 'from',
    to: 'to',
    amount: 'amount',
    status: 'status'
  };

  public iconSort: string = `${environment.assetsPath}/images/shared/components/table/icon-sort.svg`;
  public iconSortActive: string = `${environment.assetsPath}/images/shared/components/table/icon-sort-active.svg`;

  dataSource: any;

  isExpansionDetailRow = (i: number, row: Object) => row.hasOwnProperty('detailRow');
  expandedElement: any = null;

  constructor(private changeDetectorRefs: ChangeDetectorRef) {

  }

  getExpandedState(data) {
    let expState = 'collapsed';
    if ((this.tableType === 'wallet' && data.txId === this.expandedElement.txId) ||
        (this.tableType === 'utxo' && data.id === this.expandedElement.id) ||
        (this.tableType === 'addresses' && data.address === this.expandedElement.address)) {
      expState = 'expanded';
    }

    return expState;
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.tableData) {
      if (this.expandedElement === null && this.tableType === 'wallet') {
        this.expandedElement = {txId: null};
      } else if (this.expandedElement === null && this.tableType === 'utxo') {
        this.expandedElement = {id: null};
      } else if (this.expandedElement === null && this.tableType === 'addresses') {
        this.expandedElement = {address: null};
      }
      this.dataSource = new ExampleDataSource(changes.tableData.currentValue);
      //this.changeDetectorRefs.detectChanges();
    }
  }

  expandElement(row) {
    if (this.expandedElement.txId !== null && this.expandedElement === row) {
      if (this.tableType === 'wallet') {
        this.expandedElement = {txId: null};
      } else if (this.tableType === 'utxo') {
        this.expandedElement = {id: null};
      } else if (this.tableType === 'addresses') {
        this.expandedElement = {address: null};
      }
    } else {
      this.expandedElement = row;
    }
  }

  getItemSrc(item) {
    // return item.path === this.router.url ? item.srcOn : (item.src || item.srcOut);
  }

  sortClicked(item) {
    this.activeSortItem = item;
  }

  showActions($event) {
    $event.stopPropagation();

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
