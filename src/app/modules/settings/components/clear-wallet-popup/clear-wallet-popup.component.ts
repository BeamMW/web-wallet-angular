import { Component, OnInit, OnDestroy } from '@angular/core';
import {Router} from '@angular/router';
import { ActivatedRoute} from '@angular/router';
import { DataService, WindowService, LogService } from './../../../../services';
import { Subscription, Observable } from 'rxjs';
import { environment } from '@environment';
import { transactionsStatuses } from '@consts';
import { Store, select } from '@ngrx/store';
import { selectAllTr } from '../../../../store/selectors/transaction.selectors';

@Component({
  selector: 'app-clear-wallet-popup',
  templateUrl: './clear-wallet-popup.component.html',
  styleUrls: ['./clear-wallet-popup.component.scss']
})
export class ClearWalletPopupComponent implements OnInit, OnDestroy {
  wallet$: Observable<any>;
  sub: Subscription;
  isFullScreen = false;

  deleteTransactionsChecked = false;
  deleteLogsChecked = false;

  public iconCheckbox: string = `${environment.assetsPath}/images/modules/settings/components/clear-wallet-popup/check-box.svg`;
  public iconFilledCheckbox: string = `${environment.assetsPath}/images/modules/settings/components/clear-wallet-popup/check-box-fill.svg`;

  constructor(private windowSerivce: WindowService,
              public router: Router,
              public store: Store<any>,
              private activatedRoute: ActivatedRoute,
              private logService: LogService,
              private dataService: DataService) {
    this.isFullScreen = windowSerivce.isFullSize();
  }

  ngOnInit() {
    this.dataService.emitChange({popupOpened: true});
  }

  ngOnDestroy() {
    this.dataService.emitChange({popupOpened: false});
    if (this.sub !== undefined) {
      this.sub.unsubscribe();
    }
  }

  isAbleToDelete(status: string) {
    let result = false;
    if (status === transactionsStatuses.CANCELED ||
      status === transactionsStatuses.COMPLETED ||
      status === transactionsStatuses.EXPIRED ||
      status === transactionsStatuses.FAILED ||
      status === transactionsStatuses.RECEIVED ||
      status === transactionsStatuses.SENT ||
      status === transactionsStatuses.SENT_TO_OWN_ADDRESS) {
        result = !result;
    }

    return result;
  }

  submit($event) {
    if (this.deleteLogsChecked) {
      this.logService.emptyLogs();
    }

    if (this.deleteTransactionsChecked) {
      const transactions = this.store.pipe(select(selectAllTr));
      transactions.subscribe(item => {
        item.forEach(transaction => {
          if (this.isAbleToDelete(transaction.status_string)) {
            this.dataService.deleteTransaction(transaction.txId);
          }
        });
      }).unsubscribe();
    }

    this.dataService.emitChange({popupOpened: false});
    this.router.navigate([{ outlets: { popup: null }}], {relativeTo: this.activatedRoute.parent});
  }

  cancelClicked($event) {
    $event.stopPropagation();
    this.closePopup();
  }

  closePopup() {
    this.router.navigate([{ outlets: { popup: null }}], {relativeTo: this.activatedRoute.parent});
  }

  clearTransactionsClicked() {
    this.deleteTransactionsChecked = !this.deleteTransactionsChecked;
  }

  clearLogsClicked() {
    this.deleteLogsChecked = !this.deleteLogsChecked;
  }
}
