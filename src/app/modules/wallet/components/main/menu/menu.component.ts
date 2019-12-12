import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import { environment } from '@environment';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  public iconAddresses: string = `${environment.assetsPath}/images/modules/wallet/components/menu/ic-addressbook.svg`;
  public iconUtxo: string = `${environment.assetsPath}/images/modules/wallet/components/menu/ic-utxo.svg`;
  public iconWallet: string = `${environment.assetsPath}/images/modules/wallet/components/menu/ic-wallet-active.svg`;
  public iconSettings: string = `${environment.assetsPath}/images/modules/wallet/components/menu/icon-settings.svg`;

  public walletRoute = '/wallet/main';

  constructor(public router: Router,) { }

  ngOnInit() {
  }

  closeMenu() {
    this.router.navigate(
      ['/wallet/main']
    );
  }

}
