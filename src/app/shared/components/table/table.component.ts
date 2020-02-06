import { Component, Input, OnInit } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Observable, of } from 'rxjs';
import { animate, state, style, transition, trigger } from '@angular/animations';

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
export class TableComponent implements OnInit {
  @Input() tableData: any;
  @Input() tableColumns: any;
  @Input() tableType: any;

  dataSource: any;

  isExpansionDetailRow = (i: number, row: Object) => row.hasOwnProperty('detailRow');
  expandedElement: any = null;

  ngOnInit() {
    this.dataSource = new ExampleDataSource(this.tableData);
  }

  expandElement(row) {
    if (this.expandedElement !== null && this.expandedElement === row) {
      this.expandedElement = null;
    } else {
      this.expandedElement = row;
    }
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
