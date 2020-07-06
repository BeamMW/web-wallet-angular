import { Component, OnInit, OnDestroy } from '@angular/core';
import {Router} from '@angular/router';
import { ActivatedRoute} from '@angular/router';
import { DataService, WindowService, LogService } from './../../../../services';
import { Subscription, Observable } from 'rxjs';
import { environment } from '@environment';

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

  submit($event) {
    $event.stopPropagation();

    if (this.deleteLogsChecked) {
      this.logService.emptyLogs();
    }

    if (this.deleteTransactionsChecked) {

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
