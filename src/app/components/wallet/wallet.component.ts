import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

interface ROUTE {
  icon?: string;
  route?: string;
  title?: string;
}

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class WalletComponent implements OnInit {
  port: string;
  walletRoutes: ROUTE[] = [
    {
      icon: 'icon-wallet',
      route: 'transactions',
      title: 'Wallet'
    }, {
      icon: 'icon-addressbook',
      route: 'addresses',
      title: 'Addresses'
    }, {
      icon: 'icon-utxo',
      route: 'utxo',
      title: 'UTXO'
    }
  ];
  activeSidenavItem = this.walletRoutes[0];

  constructor(private router: Router,
              private route: ActivatedRoute) { }

  sidenavItemClicked(item) {
    this.activeSidenavItem = item;
    this.router.navigate([item.route], {relativeTo: this.route});
  }

  toManager() {
    this.router.navigate(
      ['']
    );
  }

  ngOnInit() {
  const splittedUrl = this.router.url.split('/');
  const activeRoute = this.walletRoutes.find(routeItem =>
    routeItem.route === splittedUrl[splittedUrl.length - 1]);

  this.activeSidenavItem = activeRoute !== undefined ? activeRoute : this.walletRoutes[0];

   this.route.params.subscribe( (params) => {
      this.port = params.port;
   });
  }
}
