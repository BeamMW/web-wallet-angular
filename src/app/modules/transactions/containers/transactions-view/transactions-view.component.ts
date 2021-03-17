import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from '@environment';
import { Router } from '@angular/router';
import { DataService } from '@app/services';
import { Store, select } from '@ngrx/store';
import { 
  selectAllTr, 
  selectInProgressTr, 
  selectReceivedTr, 
  selectSentTr } from '@app/store/selectors/transaction.selectors';
import { Subscription, Observable } from 'rxjs';
import { routes } from '@consts';

export enum selectorTitles {
  ALL = 'All',
  IN_PROGRESS = 'In progress',
  SENT = 'Sent',
  RECEIVED = 'Received'
}

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
  public trSelectorTitles = selectorTitles;
  public trSelectorActiveTitle = selectorTitles.ALL;

  public iconDrop: string = `${environment.assetsPath}/images/modules/addresses/components/address-type-menu/arrow.svg`;
  selectedItem = {};
  isDropdownVisible = false;

  constructor(public router: Router,
              public store: Store<any>,
              public dataService: DataService) {
    this.transactions$ = this.store.pipe(select(selectAllTr));
  }

  ngOnInit() {
    this.pageActive = true;
  }

  ngOnDestroy() {
    if (this.sub !== undefined) {
      this.sub.unsubscribe();
    }
    this.pageActive = false;
  }

  backClicked(event) {
    event.stopPropagation();
    this.router.navigate([routes.WALLET_MAIN_ROUTE]);
  }

  changeDropdownState(event) {
    event.stopPropagation();
    this.isDropdownVisible = !this.isDropdownVisible;
  }

  selectAllItem() {
    this.transactions$ = this.store.pipe(select(selectAllTr));
    this.trSelectorActiveTitle = selectorTitles.ALL;
    this.isDropdownVisible = false;
  }

  selectInProgressItem() {
    this.transactions$ = this.store.pipe(select(selectInProgressTr));
    this.trSelectorActiveTitle = selectorTitles.IN_PROGRESS;
    this.isDropdownVisible = false;
  }

  selectSentItem() {
    this.transactions$ = this.store.pipe(select(selectSentTr));
    this.trSelectorActiveTitle = selectorTitles.SENT;
    this.isDropdownVisible = false;
  }

  selectReceivedItem() {
    this.transactions$ = this.store.pipe(select(selectReceivedTr));
    this.trSelectorActiveTitle = selectorTitles.RECEIVED;
    this.isDropdownVisible = false;
  }

  onClickedOutside() {
    this.isDropdownVisible = !this.isDropdownVisible;
  }
}
