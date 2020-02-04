import { Component, OnInit } from '@angular/core';
import { environment } from '@environment';
import { WindowService } from './../../../services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-full',
  templateUrl: './menu-full.component.html',
  styleUrls: ['./menu-full.component.scss']
})
export class MenuFullComponent implements OnInit {
  private assetsPath = `${environment.assetsPath}/images/shared/components/menu/`;
  public iconBuyBeam: string = `${environment.assetsPath}/images/shared/components/full-menu/icon-where-to-buy-beam.svg`;
  menuItems = [{
      path: '/wallet/main',
      title: 'Wallet',
      hovered: false,
      src: '',
      srcOut: `${environment.assetsPath}/images/shared/components/menu/ic-wallet.svg`,
      srcOn: `${environment.assetsPath}/images/shared/components/menu/ic-wallet-active.svg`
    }, {
      path: '/addresses/list',
      title: 'Addresses',
      hovered: false,
      src: '',
      srcOut: `${environment.assetsPath}/images/shared/components/menu/ic-addressbook.svg`,
      srcOn: `${environment.assetsPath}/images/shared/components/menu/ic-addressbook-active.svg`
    }, {
      path: '/utxo/info',
      title: 'UTXO',
      hovered: false,
      src: '',
      srcOut: `${environment.assetsPath}/images/shared/components/menu/ic-utxo.svg`,
      srcOn: `${environment.assetsPath}/images/shared/components/menu/ic-utxo-active.svg`
    }, {
      path: '/settings/all',
      title: 'Settings',
      hovered: false,
      src: '',
      srcOut: `${environment.assetsPath}/images/shared/components/menu/icon-settings.svg`,
      srcOn: `${environment.assetsPath}/images/shared/components/menu/icon-settings-active.svg`
    }
  ];
  isFullScreen = false;
  constructor(private windowService: WindowService,
              public router: Router) {
    this.isFullScreen = windowService.isFullSize();
  }

  itemClicked(item) {
    
  }

  ngOnInit() {
  }

  itemMouseover(item) {
    item.src = item.srcOn;
    item.hovered = !item.hovered;
  }

  itemMouseout(item) {
    item.src = item.srcOut;
    item.hovered = !item.hovered;
  }
}
