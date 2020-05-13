import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import {Router} from '@angular/router';
import { environment } from '@environment';
import { ActivatedRoute} from '@angular/router';
import { DataService, WindowService } from './../../../services';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {
  public iconClose: string = `${environment.assetsPath}/images/shared/components/menu/icon-close.svg`;
  public iconBuyBeam: string = `${environment.assetsPath}/images/shared/components/menu/icon-where-to-buy-beam.svg`;

  menuItems = [{
      path: '/wallet/main',
      title: 'Wallet',
      src: '',
      srcOut: `${environment.assetsPath}/images/shared/components/menu/ic-wallet.svg`,
      srcOn: `${environment.assetsPath}/images/shared/components/menu/ic-wallet-active.svg`
    }, {
      path: '/utxo/info',
      title: 'UTXO',
      src: '',
      srcOut: `${environment.assetsPath}/images/shared/components/menu/ic-utxo.svg`,
      srcOn: `${environment.assetsPath}/images/shared/components/menu/ic-utxo-active.svg`
    }
  ];

  constructor(
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private dataService: DataService) {
  }

  ngOnInit() {
    this.dataService.emitChange(true);
  }

  ngOnDestroy() {
    this.dataService.emitChange(false);
  }

  closeMenu() {
    this.router.navigate([{ outlets: { sidemenu: null }}], {relativeTo: this.activatedRoute.parent});
  }

  goToBuyBeam() {
    window.open('https://beam.mw/#exchanges', '_blank');
  }

  clickOutside(element) {
    const controlClicked = this.dataService.clickedElement === element || this.dataService.clickedElement.contains(element);
    if (!controlClicked) {
      this.router.navigate([{ outlets: { sidemenu: null }}], {relativeTo: this.activatedRoute.parent});
    }
  }
}
