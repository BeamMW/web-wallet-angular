import { Component, OnInit } from '@angular/core';
import { environment } from '@environment';
import { Router } from '@angular/router';
import { DataService } from './../../../../services/data.service';

@Component({
  selector: 'app-settings-main',
  templateUrl: './settings-main.component.html',
  styleUrls: ['./settings-main.component.scss']
})
export class SettingsMainComponent implements OnInit {
  public iconMenu: string = `${environment.assetsPath}/images/modules/wallet/containers/main/icon-menu.svg`;
  modalOpened = false;

  menuItems = [{
    path: '/settings/general',
    title: 'General',
    src: '',
    srcOut: `${environment.assetsPath}/images/modules/settings/containers/settings-main/icon-general.svg`,
    srcOn: `${environment.assetsPath}/images/modules/settings/containers/settings-main/icon-general-active.svg`,
    class: ''
  }, {
    path: '/settings/server',
    title: 'Server',
    src: '',
    srcOut: `${environment.assetsPath}/images/modules/settings/containers/settings-main/icon-server.svg`,
    srcOn: `${environment.assetsPath}/images/modules/settings/containers/settings-main/icon-server-active.svg`,
    class: ''
  }, {
    path: '/settings/privacy',
    title: 'Privacy',
    src: '',
    srcOut: `${environment.assetsPath}/images/modules/settings/containers/settings-main/icon-privacy.svg`,
    srcOn: `${environment.assetsPath}/images/modules/settings/containers/settings-main/icon-privacy-active.svg`,
    class: ''
  }, {
    path: '/settings/utilities',
    title: 'Utilities',
    src: '',
    srcOut: `${environment.assetsPath}/images/modules/settings/containers/settings-main/icon-utilities.svg`,
    srcOn: `${environment.assetsPath}/images/modules/settings/containers/settings-main/icon-utilities-active.svg`,
    class: ''
  }, {
    path: '/settings/report',
    title: 'Report a problem',
    src: '',
    srcOut: `${environment.assetsPath}/images/modules/settings/containers/settings-main/icon-report.svg`,
    srcOn: `${environment.assetsPath}/images/modules/settings/containers/settings-main/icon-report-active.svg`,
    class: ''
  }, {
    path: '',
    title: 'Remove current wallet',
    src: '',
    srcOut: `${environment.assetsPath}/images/modules/settings/containers/settings-main/icon-remove.svg`,
    srcOn: `${environment.assetsPath}/images/modules/settings/containers/settings-main/icon-remove-active.svg`,
    class: 'remove'
  }
];

  constructor(public router: Router,
              private dataService: DataService) {
    dataService.changeEmitted$.subscribe(emittedState => {
      this.modalOpened = emittedState;
    });
   }

  ngOnInit() {
    
  }

  sideMenuClicked(event) {
    event.stopPropagation();
    this.router.navigate([this.router.url, { outlets: { sidemenu: 'menu' }}]);
  }
}
