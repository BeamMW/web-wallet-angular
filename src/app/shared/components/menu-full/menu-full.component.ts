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
      path: '/utxo/info',
      title: 'UTXO',
      hovered: false,
      src: '',
      srcOut: `${environment.assetsPath}/images/shared/components/menu/ic-utxo.svg`,
      srcOn: `${environment.assetsPath}/images/shared/components/menu/ic-utxo-active.svg`
    }
  ];
  isFullScreen = false;
  constructor(private windowService: WindowService,
              public router: Router) {
    this.isFullScreen = windowService.isFullSize();
  }

  itemClicked(item) {}

  getItemSrc(item) {
    if (item !== undefined) {
      if (item.path === '/wallet/main' &&
          (this.router.url === '/send/addresses' ||
          this.router.url === '/send/confirmation' ||
          this.router.url === '/send/amount' ||
          this.router.url === '/receive/page')) {
        return item.srcOn;
      }
      return item.path === this.router.url ? item.srcOn : (item.src || item.srcOut);
    }
  }

  isSideActive(item) {
    if (item !== undefined) {
      return item.hovered || item.path === this.router.url || (item.path === '/wallet/main' &&
        (this.router.url === '/send/addresses' ||
        this.router.url === '/send/confirmation' ||
        this.router.url === '/send/amount' ||
        this.router.url === '/receive/page'));
    }
  }

  ngOnInit() {
  }

  itemMouseover(item) {
    item.src = item.srcOn;
  }

  itemMouseout(item) {
    item.src = item.srcOut;
  }
}
