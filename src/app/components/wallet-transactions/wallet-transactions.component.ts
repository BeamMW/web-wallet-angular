import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import {DataService} from '../../services/data.service';
import {ActivatedRoute, Router} from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Sort } from '@angular/material';

const GROTHS_IN_BEAM = 100000000;

@Component({
  selector: 'app-wallet-transactions',
  templateUrl: './wallet-transactions.component.html',
  styleUrls: ['./wallet-transactions.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class WalletTransactionsComponent implements OnInit {
  selectedElem: any;
  displayedColumns: string[] = ['icon', 'date', 'to', 'sent', 'status', 'actions'];
  transactionOptions = [
      {num: 1, name: 'copy address'},
      {num: 2, name: 'cancel'},
      {num: 3, name: 'delete'}
  ];
  port: string;
  statuses = [
    {id: 0, name: 'Pending'},
    {id: 1, name: 'InProgress'},
    {id: 2, name: 'Cancelled'},
    {id: 3, name: 'Completed'},
    {id: 4, name: 'Failed'},
    {id: 5, name: 'Registering'}];
  status_loading: boolean;
  transactions_loading: boolean;
  columns = [
    'name',
    'value'
  ];

  wallet_transactions: any = [];
  sortedData: any = [];
  wallet_status: any;

  expandedItem: any;

  @HostListener('document:click', ['$event']) clickout(event) {
    if (this.selectedElem !== undefined) {
      this.selectedElem.style['visibility'] = 'hidden';
    }
  }
  isExpansionDetailRow = (i: number, row: Object) => row.hasOwnProperty('detailRow');

  constructor(private dataService: DataService,
              private router: Router,
              private route: ActivatedRoute) { }

  showOptions(event) {
    event.stopPropagation();
    if (this.selectedElem !== undefined) {
      this.selectedElem.style['visibility'] = 'hidden';
    }
    this.selectedElem = event.srcElement.nextElementSibling;
    this.selectedElem.style['visibility'] = 'visible';
  }

  itemOptionChange(event, option, item) {
    event.stopPropagation();
    if (this.transactionOptions[0].num === option.num) {
      const selBox = document.createElement('textarea');
      selBox.style.position = 'fixed';
      selBox.style.left = '0';
      selBox.style.top = '0';
      selBox.style.opacity = '0';
      selBox.value = item.receiver;
      document.body.appendChild(selBox);
      selBox.focus();
      selBox.select();
      document.execCommand('copy');
      document.body.removeChild(selBox);
    } else if (this.transactionOptions[1].num === option.num) {
      this.dataService.txCancel(this.port, item.txId).subscribe((result) => {
        this.update();
      });
    } else if (this.transactionOptions[2].num === option.num) {
      this.dataService.txDelete(this.port, item.txId).subscribe((result) => {
        this.update();
      });
    }
    this.selectedElem.style['visibility'] = 'hidden';
  }

  toggleElement(value) {
    const foundElement = this.wallet_transactions.find(elem => elem.item !== undefined && elem.item.txId === value.txId);
    const index = this.wallet_transactions.indexOf(foundElement);
    this.wallet_transactions[index].item.show = !this.wallet_transactions[index].item.show;
  }

  receiveClicked() {
    this.router.navigate(['wallet/' + this.port + '/receive']);
  }

  sendClicked() {
    this.router.navigate(['wallet/' + this.port + '/send']);
  }

  swapClicked() {
    this.router.navigate(['wallet/' + this.port + '/swap']);
  }

  update() {
    this.dataService.loadWalletStatus(this.port).subscribe((status) => {
      this.wallet_status = status;
      this.wallet_status.available /= GROTHS_IN_BEAM;
      this.wallet_status.receiving /= GROTHS_IN_BEAM;
      this.wallet_status.sending /= GROTHS_IN_BEAM;
      this.wallet_status.maturing /= GROTHS_IN_BEAM;
      this.status_loading = false;
    });

    this.dataService.loadTxList(this.port).subscribe((list) => {
      this.wallet_transactions = [];
      this.sortedData = [];
      list.forEach((item) => {
        item.statusName = this.statuses.find(status => status.id === item.status).name;
        item.value = item.value < GROTHS_IN_BEAM ? (item.value / GROTHS_IN_BEAM).toFixed(8)
          : item.value / GROTHS_IN_BEAM;
        item.show = false;

        item.tableData = [
          {name: 'Sending address:', value: item.sender},
          {name: 'Receiving address:', value: item.receiver},
          {name: 'Transaction fee:', value: item.fee},
          {name: 'Comment:', value: item.comment},
          {name: 'Kernel ID:', value: item.kernel},
          {name: 'Error:', value: ' '}
          ];
        this.wallet_transactions.push(item, { detailRow: true, item });
      });
      this.sortedData = this.wallet_transactions.slice();
      this.transactions_loading = false;
    });
  }

  ngOnInit() {
    this.status_loading = true;
    this.transactions_loading = true;
    this.port = this.route.snapshot.parent.params.port;

    this.update();
    setInterval(this.update.bind(this), 10000);
  }

  sortData(sort: Sort) {
    const data = this.wallet_transactions.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'date': return this.compare(a.create_time, b.create_time, isAsc);
        case 'address': return this.compare(a.receiver, b.receiver, isAsc);
        case 'amount': return this.compare(a.value, b.value, isAsc);
        case 'status': return this.compare(a.status_string, b.status_string, isAsc);
        default: return 0;
      }
    });
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
}
