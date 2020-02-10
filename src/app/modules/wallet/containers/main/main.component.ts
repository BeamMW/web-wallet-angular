import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { WasmService } from './../../../../wasm.service';
import { WebsocketService } from './../../../websocket';
import { Subscription, Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { loadAddresses, loadUtxo, loadTr, saveWalletStatus } from './../../../../store/actions/wallet.actions';
import { selectAllAddresses } from '../../../../store/selectors/address.selectors';
import { selectAllUtxo } from '../../../../store/selectors/utxo.selectors';
import { selectAllTr, selectInProgressTr, selectReceivedTr, selectSentTr } from '../../../../store/selectors/transaction.selectors';
import { selectAppState } from '../../../../store/selectors/wallet-state.selectors';
import { DataService, WindowService } from './../../../../services';

import { environment } from '@environment';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {
  public iconBeam: string = `${environment.assetsPath}/images/modules/wallet/containers/main/ic-beam.svg`;
  public iconBeamFull: string = `${environment.assetsPath}/images/modules/wallet/containers/main/icon-beam-full.svg`;
  public iconReceived: string = `${environment.assetsPath}/images/modules/wallet/containers/main/icon-received.svg`;
  public iconSent: string = `${environment.assetsPath}/images/modules/wallet/containers/main/icon-sent.svg`;
  public iconMenu: string = `${environment.assetsPath}/images/modules/wallet/containers/main/icon-menu.svg`;
  public iconEmpty: string = `${environment.assetsPath}/images/modules/wallet/containers/main/atomic-empty-state.svg`;
  public iconDisabledPrivacy: string = `${environment.assetsPath}/images/modules/wallet/containers/main/icn-eye.svg`; 
  public iconEnabledPrivacy: string = `${environment.assetsPath}/images/modules/wallet/containers/main/icn-eye-crossed.svg`;

  public sendRoute = '/send/addresses';
  public receiveRoute = '/receive/page';
  public tableType = 'wallet';
  public tableColumns = ['created', 'from', 'to', 'amount', 'status'];

  public selectorValues = [{
    title: 'All',
    active: true
  }, {
    title: 'In progress',
    active: false
  }, {
    title: 'Sent',
    active: false
  }, {
    title: 'Received',
    active: false
  }];
  public activeSelectorItem = this.selectorValues[0];

  private sub: Subscription;
  private mainActive = false;
  transactionsLoaded = false;
  modalOpened = false;
  addresses$: Observable<any>;
  utxos$: Observable<any>;
  transactions$: Observable<any>;
  addressesColumns: string[] = ['address', 'created', 'comment'];
  utxoColumns: string[] = ['utxo', 'amount', 'status'];
  transcationsColumns: string[] = ['sender', 'value', 'txId'];

  walletStatusLoaded = false;
  walletStatus = {
    available: 0,
    currentHeight: 0,
    current_state_hash: '',
    difficulty: 0,
    maturing: 0,
    prev_state_hash: '',
    receiving: '',
    sending: ''
  };

  privacyMode = false;
  isFullScreen = false;
  activeSidenavItem = '';

  constructor(private store: Store<any>,
              private wasm: WasmService,
              public router: Router,
              private windowService: WindowService,
              private wsService: WebsocketService,
              private dataService: DataService) {
    this.isFullScreen = windowService.isFullSize();
    this.addresses$ = this.store.pipe(select(selectAllAddresses));
    this.utxos$ = this.store.pipe(select(selectAllUtxo));
    this.transactions$ = this.store.pipe(select(selectAllTr));

    dataService.changeEmitted$.subscribe(emittedState => {
      this.modalOpened = emittedState;
    });
  }

  private transactionsUpdate() {
    this.sub = this.wsService.on().subscribe((msg: any) => {
      if (msg.result) {
        console.log('[main-page] transactions');
        console.log(msg.result)
        if (msg.result.length !== undefined) {
          this.store.dispatch(loadTr({transactions: msg.result}));
        } else {
          this.store.dispatch(loadTr({transactions: [msg.result]}));
        }
        this.transactionsLoaded = true;

        this.sub.unsubscribe();
        setTimeout(() => {
          if (this.mainActive) {
            this.update();
          }
        }, 5000);
      }
    });
    this.wsService.send({
      jsonrpc: '2.0',
      id: 0,
      method: 'tx_list'
    });
  }

  private utxoUpdate() {
    this.sub = this.wsService.on().subscribe((msg: any) => {
      if (msg.result) {
        console.log('[main-page] utxo');
        console.log(msg.result)
        if (msg.result.length !== undefined) {
          this.store.dispatch(loadUtxo({utxos: msg.result}));
        } else {
          this.store.dispatch(loadUtxo({utxos: [msg.result]}));
        }

        this.sub.unsubscribe();
        this.transactionsUpdate();
      }
    });
    this.wsService.send({
      jsonrpc: '2.0',
      id: 0,
      method: 'get_utxo'
    });
  }

  private addressUpdate() {
    this.sub = this.wsService.on().subscribe((msg: any) => {
      if (msg.result) {
        console.log('[main-page] addresses', msg.result)
        if (msg.result.length !== undefined) {
          this.store.dispatch(loadAddresses({addresses: msg.result}));
        } else {
          this.store.dispatch(loadAddresses({addresses: [msg.result]}));
        }

        this.sub.unsubscribe();
        this.utxoUpdate();
      }
    });
    this.wsService.send({
      jsonrpc: '2.0',
      id: 0,
      method: 'addr_list',
      params:
      {
        own: true
      }
    });
  }

  private update() {
    this.sub = this.wsService.on().subscribe((msg: any) => {
      if (msg.result) {
        console.log('[main-page] update: ');
        console.dir(msg);

        this.store.dispatch(saveWalletStatus({status: msg.result}));

        this.walletStatus.available = msg.result.available;
        this.walletStatus.currentHeight = msg.result.current_height;
        this.walletStatus.current_state_hash = msg.result.current_state_hash;
        this.walletStatus.difficulty = msg.result.difficulty;
        this.walletStatus.maturing = msg.result.maturing;
        this.walletStatus.prev_state_hash = msg.result.prev_state_hash;
        this.walletStatus.receiving = msg.result.receiving;
        this.walletStatus.sending = msg.result.sending;

        this.sub.unsubscribe();
        this.walletStatusLoaded = true;
        this.addressUpdate();
      }
    });

    this.wsService.send({
      jsonrpc: '2.0',
      id: 0,
      method: 'wallet_status'
    });
  }

  ngOnInit() {
    this.mainActive = true;
    this.update();
  }

  ngOnDestroy() {
    if (this.sub !== undefined) {
      this.sub.unsubscribe();
    }
    this.mainActive = false;
  }

  expandedView() {
    // const extensionURL = chrome.runtime.getURL('index.html#wallet/main');
    // chrome.tabs.create({ url: extensionURL });
  }

  sidenavItemClicked(item) {
    // this.activeSidenavItem = item;
    // this.router.navigate([item.route], {relativeTo: this.route});
  }

  sideMenuClicked(event) {
    event.stopPropagation();
    this.router.navigate([this.router.url, { outlets: { sidemenu: 'menu' }}]);
  }

  showAllTransactions() {
    this.router.navigate(['/transactions/view']);
  }

  privacyControl() {
    this.privacyMode = !this.privacyMode;
    // this.dataService.saveAppState();
  }

  selectorItemClicked(item) {
    this.activeSelectorItem.active = false;
    item.active = true;
    this.activeSelectorItem = item;

    if (item.title === this.selectorValues[0].title) {
      this.transactions$ = this.store.pipe(select(selectAllTr));
    } else if (item.title === this.selectorValues[1].title) {
      this.transactions$ = this.store.pipe(select(selectInProgressTr));
    } else if (item.title === this.selectorValues[2].title) {
      this.transactions$ = this.store.pipe(select(selectSentTr));
    } else if (item.title === this.selectorValues[3].title) {
      this.transactions$ = this.store.pipe(select(selectReceivedTr));
    }
  }
}

