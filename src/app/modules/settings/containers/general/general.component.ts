import { Component, OnInit } from '@angular/core';
import { environment } from '@environment';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  selectSaveLogsSetting,
  selectCurrencySetting,
} from '../../../../store/selectors/wallet-state.selectors';
import { DataService } from './../../../../services';
import {
  updateSaveLogsSetting,
  updateCurrencySetting,
} from './../../../../store/actions/wallet.actions';

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss']
})
export class GeneralComponent implements OnInit {
  public iconBack: string = `${environment.assetsPath}/images/modules/send/containers/send-addresses/icon-back.svg`;

  public logsMenuItems = [{
    title: 'Last 5 days', id: 0
  }, {
    title: 'Last 15 days', id: 1
  }, {
    title: 'Last 30 days', id: 2
  }, {
    title: 'For all time', id: 3
  }];

  public currencyMenuItems = [{
    title: 'USD (United State Dollar)', id: 0
  }, {
    title: 'BTC (Bitcoin)', id: 1
  }, {
    title: 'LTC (Litecoin)', id: 2
  }, {
    title: 'QTUM', id: 3
  }];

  currencySetting$: Observable<any>;
  currencySelectedItem = this.currencyMenuItems[0];
  currencyUpdated = null;
  savelogsSetting$: Observable<any>;
  saveLogsSelectedItem = this.logsMenuItems[0];
  popupOpened = false;

  constructor(
      private dataService: DataService,
      private store: Store<any>,
      public router: Router) {
    this.currencySetting$ = this.store.pipe(select(selectCurrencySetting));
    this.currencySetting$.subscribe((state) => {
      this.currencySelectedItem = this.currencyMenuItems[state.value];
      this.currencyUpdated = state.updated;
    });

    this.savelogsSetting$ = this.store.pipe(select(selectSaveLogsSetting));
    this.savelogsSetting$.subscribe((state) => {
      this.saveLogsSelectedItem = this.logsMenuItems[state];
    });

    dataService.changeEmitted$.subscribe(emittedState => {
      if (emittedState.popupOpened !== undefined) {
        this.popupOpened = emittedState.popupOpened;
      }
    });
  }

  ngOnInit() {
  }

  backClicked(event) {
    event.stopPropagation();
    this.router.navigate(['/settings/all']);
  }

  logsDropdownSelected(item) {
    this.store.dispatch(updateSaveLogsSetting({settingValue: item.id}));
    this.dataService.saveWalletOptions();
  }

  currencyDropdownSelected(item) {
    this.store.dispatch(updateCurrencySetting({settingValue: {value: item.id, updated: new Date().getTime()}}));
    this.dataService.saveWalletOptions();
  }

  clearLocalWalletClicked($event) {
    $event.stopPropagation();
    this.router.navigate([this.router.url, { outlets: { popup: 'clear-wallet-popup' }}]);
  }
}
