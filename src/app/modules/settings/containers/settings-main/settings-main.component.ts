import { Component, OnInit } from '@angular/core';
import { environment } from '@environment';
import { Router } from '@angular/router';
import { DataService, WindowService } from './../../../../services';

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
  menuItems = [{
    path: '/settings/general',
    title: 'General',
    src: '',
    srcOut: `${environment.assetsPath}/images/modules/settings/containers/settings-main/icon-general.svg`,
    srcOn: `${environment.assetsPath}/images/modules/settings/containers/settings-main/icon-general-active.svg`,
    class: '',
    expandable: true
  }, {
    path: '/settings/server',
    title: 'Server',
    src: '',
    srcOut: `${environment.assetsPath}/images/modules/settings/containers/settings-main/icon-server.svg`,
    srcOn: `${environment.assetsPath}/images/modules/settings/containers/settings-main/icon-server-active.svg`,
    class: '',
    expandable: true
  }, {
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
    path: '/settings/report',
    title: 'Report a problem',
    src: '',
    srcOut: `${environment.assetsPath}/images/modules/settings/containers/settings-main/icon-report.svg`,
    srcOn: `${environment.assetsPath}/images/modules/settings/containers/settings-main/icon-report-active.svg`,
    class: '',
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
  public logsMenuItems = [{
    title: 'For all time', id: 2, selected: true
  }, {
    title: 'Last 5 days', id: 0, selected: false
  }, {
    title: 'Last 30 days', id: 1, selected: false
  }];

  public currencyMenuItems = [{
    title: 'USD (United State Dollar)', id: 0, selected: true
  }, {
    title: 'BTC (Bitcoin)', id: 1, selected: false
  }, {
    title: 'LTC (Litecoin)', id: 2, selected: false
  }, {
    title: 'QTUM', id: 3, selected: false
  }];

  constructor(public router: Router,
              private windowService: WindowService,
              private dataService: DataService) {
    this.isFullScreen = this.windowService.isFullSize();
    dataService.changeEmitted$.subscribe(emittedState => {
      this.modalOpened = emittedState;
    });
   }

  ngOnInit() {}

  sideMenuClicked(event) {
    event.stopPropagation();
    this.router.navigate([this.router.url, { outlets: { sidemenu: 'menu' }}]);
  }

  menuItemClickedFull(item) {
    this.activeItem = this.activeItem === item ? false : item;
  }

  logsDropdownSelected(item) {
    if (item === this.logsDropdownSelected[0]) {

    } else if (item === this.logsDropdownSelected[1]) {

    } else if (item === this.logsDropdownSelected[2]) {

    }
  }
}
