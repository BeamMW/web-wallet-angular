import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { WasmService } from './../../../../wasm.service';
import { WebsocketService } from './../../../websocket';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  selectAllUtxo,
  selectAvailableUtxo,
  selectInProgressUtxo,
  selectSpentUtxo,
  selectUnavailableUtxo } from '../../../../store/selectors/utxo.selectors';
import { selectWalletStatus } from '../../../../store/selectors/wallet-state.selectors';
import { DataService, WindowService } from './../../../../services';

import { environment } from '@environment';

@Component({
  selector: 'app-utxo-main',
  templateUrl: './utxo-main.component.html',
  styleUrls: ['./utxo-main.component.scss']
})
export class UtxoMainComponent implements OnInit {
  public iconMenu: string = `${environment.assetsPath}/images/modules/wallet/containers/main/icon-menu.svg`;
  public iconEmpty: string = `${environment.assetsPath}/images/modules/utxo/containers/utxo-main/icon-utxo-empty-state.svg`;
  public iconDisabledPrivacy: string = `${environment.assetsPath}/images/modules/wallet/containers/main/icn-eye.svg`; 
  public iconEnabledPrivacy: string = `${environment.assetsPath}/images/modules/wallet/containers/main/icn-eye-crossed.svg`;

  public tableType = 'utxo';
  public tableColumns = ['utxo_amount', 'utxo_maturity', 'utxo_type', 'utxo_status'];

  public menuItems = [{
    title: 'Available', selected: true
  }, {
    title: 'In progress', selected: false
  }, {
    title: 'Spent', selected: false
  }, {
    title: 'Unavailable', selected: false
  }];
  public activeSelectorItem = this.menuItems[0];

  walletStatus$: Observable<any>;
  utxos$: Observable<any>;
  isFullSize = false;

  constructor(private store: Store<any>,
              private wasm: WasmService,
              public router: Router,
              private wsService: WebsocketService,
              private windowService: WindowService,
              private dataService: DataService) {
    this.isFullSize = this.windowService.isFullSize();
    this.walletStatus$ = this.store.pipe(select(selectWalletStatus));
    this.utxos$ = this.store.pipe(select(selectAvailableUtxo));
  }

  ngOnInit() {
  }

  sideMenuClicked(event) {
    event.stopPropagation();
    this.router.navigate([this.router.url, { outlets: { sidemenu: 'menu' }}]);
  }

  selectorItemClicked(item) {
    this.activeSelectorItem.selected = false;
    item.selected = true;
    this.activeSelectorItem = item;

    if (item.title === this.menuItems[0].title) {
      this.utxos$ = this.store.pipe(select(selectAvailableUtxo));
    } else if (item.title === this.menuItems[1].title) {
      this.utxos$ = this.store.pipe(select(selectInProgressUtxo));
    } else if (item.title === this.menuItems[2].title) {
      this.utxos$ = this.store.pipe(select(selectSpentUtxo));
    } else if (item.title === this.menuItems[3].title) {
      this.utxos$ = this.store.pipe(select(selectUnavailableUtxo));
    }
  }
}
