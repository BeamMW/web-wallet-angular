import { Component, OnInit } from '@angular/core';
import { environment } from '@environment';
import { Router } from '@angular/router';
import { DataService, WindowService } from './../../../../services';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  selectSaveLogsSetting,
  selectCurrencySetting,
  selectIpSetting,
  selectDnsSetting,
  selectPasswordCheckSetting
} from '../../../../store/selectors/wallet-state.selectors';
import {
  updateSaveLogsSetting,
  updateCurrencySetting,
  updatePasswordCheckSetting,
} from './../../../../store/actions/wallet.actions';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import {
  selectVerificatedSetting
} from '../../../../store/selectors/wallet-state.selectors';

@Component({
  selector: 'app-settings-main',
  templateUrl: './settings-main.component.html',
  styleUrls: ['./settings-main.component.scss']
})
export class SettingsMainComponent implements OnInit {
  public iconMenu: string = `${environment.assetsPath}/images/modules/wallet/containers/main/icon-menu.svg`;
  modalOpened = false;
  isFullScreen = false;
  activeItem = false;
  menuItems = [];
  popupOpened = false;

  public logsMenuItems = [{
    title: 'Last 5 days', id: 0
  }, {
    title: 'Last 15 days', id: 1
  }, {
    title: 'Last 30 days', id: 2
  }, {
    title: 'For all time', id: 3
  }];

  savelogsSetting$: Observable<any>;
  saveLogsSelectedItem = this.logsMenuItems[0];

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
  dnsSetting$: Observable<any>;
  ipSetting$: Observable<any>;
  verificatedSetting$: Observable<any>;
  checkPasswordSetting$: Observable<any>;
  isCheckedPassword = true;

  verificatedSettingState = false;
  verificatedSettingLoaded = false;

  constructor(public router: Router,
              private store: Store<any>,
              private windowService: WindowService,
              private dataService: DataService) {
    this.verificatedSetting$ = this.store.pipe(select(selectVerificatedSetting));
    this.verificatedSetting$.subscribe((verState) => {
      this.verificatedSettingLoaded = true;
      this.verificatedSettingState = verState.state;
    });

    this.isFullScreen = this.windowService.isFullSize();
    dataService.changeEmitted$.subscribe(emittedState => {
      if (emittedState.popupOpened !== undefined) {
        this.popupOpened = emittedState.popupOpened;
      } else {
        this.modalOpened = emittedState;
      }
    });

    this.savelogsSetting$ = this.store.pipe(select(selectSaveLogsSetting));
    this.savelogsSetting$.subscribe((state) => {
      this.saveLogsSelectedItem = this.logsMenuItems[state];
    });

    this.currencySetting$ = this.store.pipe(select(selectCurrencySetting));
    this.currencySetting$.subscribe((state) => {
      this.currencySelectedItem = this.currencyMenuItems[state.value];
      this.currencyUpdated = state.updated;
    });

    this.dnsSetting$ = this.store.pipe(select(selectDnsSetting));
    this.ipSetting$ = this.store.pipe(select(selectIpSetting));

    this.checkPasswordSetting$ = this.store.pipe(select(selectPasswordCheckSetting));
    this.checkPasswordSetting$.subscribe((state) => {
      this.isCheckedPassword = state;
    });

    this.menuItems = [{
      path: '/settings/general',
      title: 'General',
      src: '',
      srcOut: `${environment.assetsPath}/images/modules/settings/containers/settings-main/icon-general.svg`,
      srcOn: `${environment.assetsPath}/images/modules/settings/containers/settings-main/icon-general-active.svg`,
      class: '',
      expandable: true
    }, {
    //   path: '/settings/server',
    //   title: 'Server',
    //   src: '',
    //   srcOut: `${environment.assetsPath}/images/modules/settings/containers/settings-main/icon-server.svg`,
    //   srcOn: `${environment.assetsPath}/images/modules/settings/containers/settings-main/icon-server-active.svg`,
    //   class: '',
    //   expandable: true
    // }, {
      path: '/settings/privacy',
      title: 'Privacy',
      src: '',
      srcOut: `${environment.assetsPath}/images/modules/settings/containers/settings-main/icon-privacy.svg`,
      srcOn: `${environment.assetsPath}/images/modules/settings/containers/settings-main/icon-privacy-active.svg`,
      class: '',
      expandable: true
    }, {
      path: '/settings/utilities',
      title: 'Utilities',
      src: '',
      srcOut: `${environment.assetsPath}/images/modules/settings/containers/settings-main/icon-utilities.svg`,
      srcOn: `${environment.assetsPath}/images/modules/settings/containers/settings-main/icon-utilities-active.svg`,
      class: '',
      expandable: true
    }, {
      path: '',
      title: 'Report a problem',
      src: '',
      srcOut: `${environment.assetsPath}/images/modules/settings/containers/settings-main/icon-report.svg`,
      srcOn: `${environment.assetsPath}/images/modules/settings/containers/settings-main/icon-report-active.svg`,
      class: 'report',
      expandable: false
    }, {
      path: '',
      title: 'Remove current wallet',
      src: '',
      srcOut: `${environment.assetsPath}/images/modules/settings/containers/settings-main/icon-remove.svg`,
      srcOn: `${environment.assetsPath}/images/modules/settings/containers/settings-main/icon-remove-active.svg`,
      class: 'remove',
      expandable: false
    }];
   }

  ngOnInit() {
  }

  sideMenuClicked($event) {
    this.dataService.clickedElement = $event.currentTarget;
    this.router.navigate([this.router.url, { outlets: { sidemenu: 'menu' }}]);
  }

  menuItemClickedFull(item, event) {
    if (item.class === 'remove') {
      this.router.navigate([this.router.url, { outlets: { popup: 'remove-wallet-popup' }}]);
    } else if (item.class === 'report') {
      this.router.navigate([this.router.url, { outlets: { popup: 'report-popup' }}]);
    } else {
      this.activeItem = this.activeItem === item ? false : item;
    }
    event.stopPropagation();
  }

  menuItemClicked(item, event) {
    if (item.class === 'remove') {
      this.router.navigate([this.router.url, { outlets: { popup: 'remove-wallet-popup' }}]);
    } else if (item.class === 'report') {
      this.router.navigate([this.router.url, { outlets: { popup: 'report-popup' }}]);
    } else {
      this.router.navigate([item.path]);
    }
    event.stopPropagation();
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

  enterDnsClicked($event) {
    $event.stopPropagation();
    this.router.navigate([this.router.url, { outlets: { popup: 'enter-dns-popup' }}]);
  }

  enterIpClicked($event) {
    $event.stopPropagation();
    this.router.navigate([this.router.url, { outlets: { popup: 'enter-ip-popup' }}]);
  }

  public checkPasswordToggle(event: MatSlideToggleChange) {
    this.store.dispatch(updatePasswordCheckSetting({settingValue: event.checked}));
    this.router.navigate([this.router.url, { outlets: { popup: 'check-pass-confirmation-popup'}}]);
  }

  completeVerificationClicked($event) {
    $event.stopPropagation();
    this.router.navigate([this.router.url, { outlets: { popup: 'seed-verification-popup' }}]);
  }

  changePasswordClicked($event) {
    $event.stopPropagation();
    this.router.navigate([this.router.url, { outlets: { popup: 'change-pass-popup' }}]);
  }

  getFromFaucet() {
    window.open('https://faucet.beamprivacy.community', '_blank');
  }

  paymentProofClicked($event) {
    $event.stopPropagation();
    this.router.navigate([this.router.url, { outlets: { popup: 'payment-proof' }}]);
  }

  showOwnerKeyClicked($event) {
    $event.stopPropagation();
    this.router.navigate([this.router.url, { outlets: { popup: 'show-owner-key' }}]);
  }
}
