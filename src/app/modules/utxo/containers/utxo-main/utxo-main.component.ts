import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { WasmService } from './../../../../wasm.service';
import { WebsocketService } from './../../../websocket';
import { Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { loadAddresses, loadUtxo, loadTr, loadWalletState } from './../../../../store/actions/wallet.actions';
import { selectAllUtxo } from '../../../../store/selectors/utxo.selectors';
import { selectWalletStatus } from '../../../../store/selectors/wallet-state.selectors';
import { DataService } from './../../../../services/data.service';

import { environment } from '@environment';

@Component({
  selector: 'app-utxo-main',
  templateUrl: './utxo-main.component.html',
  styleUrls: ['./utxo-main.component.scss']
})
export class UtxoMainComponent implements OnInit {
  public iconMenu: string = `${environment.assetsPath}/images/modules/wallet/containers/main/icon-menu.svg`;
  public iconEmpty: string = `${environment.assetsPath}/images/modules/wallet/containers/main/atomic-empty-state.svg`;
  public iconDisabledPrivacy: string = `${environment.assetsPath}/images/modules/wallet/containers/main/icn-eye.svg`; 
  public iconEnabledPrivacy: string = `${environment.assetsPath}/images/modules/wallet/containers/main/icn-eye-crossed.svg`;

  walletStatus$: Observable<any>;

  constructor(private store: Store<any>,
              private wasm: WasmService,
              public router: Router,
              private wsService: WebsocketService,
              private dataService: DataService) { 
      this.walletStatus$ = this.store.pipe(select(selectWalletStatus));
  }

  ngOnInit() {
  }

  log(a) {
    console.log(a);
  }

  sideMenuClicked(event) {
    event.stopPropagation();
    this.router.navigate([this.router.url, { outlets: { sidemenu: 'menu' }}]);
  }
}
