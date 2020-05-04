import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from '@environment';
import { Router } from '@angular/router';
import { DataService, WebsocketService } from './../../../../services';
import { Store, select } from '@ngrx/store';
import { loadTr } from './../../../../store/actions/wallet.actions';
import { selectAllTr, selectInProgressTr, selectReceivedTr, selectSentTr } from '../../../../store/selectors/transaction.selectors';
import { Subscription, Observable } from 'rxjs';

@Component({
  selector: 'app-transactions-view',
  templateUrl: './transactions-view.component.html',
  styleUrls: ['./transactions-view.component.scss']
})
export class TransactionsViewComponent implements OnInit, OnDestroy {
  public iconBack: string = `${environment.assetsPath}/images/modules/send/containers/send-addresses/icon-back.svg`;
  private sub: Subscription;
  private pageActive = false;
  public modalOpened = false;
  transactions$: Observable<any>;

  public menuItems = [{
    title: 'All', id: 0, selected: true
  }, {
    title: 'In progress', id: 1, selected: false
  }, {
    title: 'Sent', id: 2, selected: false
  }, {
    title: 'Received', id: 3, selected: false
  }];

  constructor(public router: Router,
              public store: Store<any>,
              public dataService: DataService,
              public wsService: WebsocketService) {
    this.transactions$ = this.store.pipe(select(selectAllTr));
  }

  private transactionsUpdate() {
    this.sub = this.wsService.on().subscribe((msg: any) => {
      if (msg.result) {
        console.log('[transactions-page] transactions');
        console.log(msg.result)
        if (msg.result.length !== undefined) {
          this.store.dispatch(loadTr({transactions: msg.result}));
        } else {
          this.store.dispatch(loadTr({transactions: [msg.result]}));
        }

        this.sub.unsubscribe();
        // setTimeout(() => {
        //   if (this.pageActive) {
        //     this.transactionsUpdate();
        //   }
        // }, 5000);
      }
    });
    this.wsService.send({
      jsonrpc: '2.0',
      id: 0,
      method: 'tx_list'
    });
  }

  ngOnInit() {
    this.pageActive = true;
    this.transactionsUpdate();
  }

  ngOnDestroy() {
    if (this.sub !== undefined) {
      this.sub.unsubscribe();
    }
    this.pageActive = false;
  }

  backClicked(event) {
    event.stopPropagation();
    this.router.navigate(['/wallet/main']);
  }

  dropdownSelected(item) {
    if (item === this.menuItems[0]) {
      this.transactions$ = this.store.pipe(select(selectAllTr));
    } else if (item === this.menuItems[1]) {
      this.transactions$ = this.store.pipe(select(selectInProgressTr));
    } else if (item === this.menuItems[2]) {
      this.transactions$ = this.store.pipe(select(selectSentTr));
    } else if (item === this.menuItems[3]) {
      this.transactions$ = this.store.pipe(select(selectReceivedTr));
    }
  }

}
