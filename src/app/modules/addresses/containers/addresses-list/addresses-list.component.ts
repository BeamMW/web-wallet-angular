import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from '@environment';
import { Router } from '@angular/router';
import { DataService, WindowService } from './../../../../services';
import { WebsocketService } from './../../../websocket';
import { Store, select } from '@ngrx/store';
import { loadAddresses } from './../../../../store/actions/wallet.actions';
import { selectAllAddresses, selectExpiredAddresses, selectActiveAddresses } from '../../../../store/selectors/address.selectors';
import { Subscription, Observable } from 'rxjs';

@Component({
  selector: 'app-addresses-list',
  templateUrl: './addresses-list.component.html',
  styleUrls: ['./addresses-list.component.scss']
})
export class AddressesListComponent implements OnInit, OnDestroy {
  public iconMenu = `${environment.assetsPath}/images/modules/wallet/containers/main/icon-menu.svg`;
  private sub: Subscription;
  private pageActive = false;
  public modalOpened = false;
  public isFullScreen = false;
  addresses$: Observable<any>;

  public menuItems = [{
    title: 'My active', id: 0, selected: true
  }, {
    title: 'My expired', id: 1, selected: false
  }, {
    title: 'Contacts', id: 2, selected: false
  }];

  constructor(public router: Router,
              public store: Store<any>,
              public dataService: DataService,
              private windowService: WindowService,
              public wsService: WebsocketService) {
    this.isFullScreen = windowService.isFullSize();
    this.addresses$ = this.store.pipe(select(selectActiveAddresses));
    dataService.changeEmitted$.subscribe(emittedState => {
      this.modalOpened = emittedState;
    });
  }

  private addressesUpdate() {
    this.sub = this.wsService.on().subscribe((msg: any) => {
      if (msg.result) {
        console.log('[addresses-page] addresses')
        if (msg.result.length !== undefined) {
          this.store.dispatch(loadAddresses({addresses: msg.result}));
        } else {
          this.store.dispatch(loadAddresses({addresses: [msg.result]}));
        }

        this.sub.unsubscribe();
        // setTimeout(() => {
        //   if (this.pageActive) {
        //     this.addressesUpdate();
        //   }
        // }, 5000);
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

  ngOnInit() {
    this.pageActive = true;
  }

  ngOnDestroy() {
    if (this.sub !== undefined) {
      this.sub.unsubscribe();
    }
    this.pageActive = false;
  }

  sideMenuClicked(event) {
    event.stopPropagation();
    this.router.navigate([this.router.url, { outlets: { sidemenu: 'menu' }}]);
  }

  dropdownSelected(item) {
    if (item === this.menuItems[0]) {
      this.addresses$ = this.store.pipe(select(selectActiveAddresses));
    } else if (item === this.menuItems[1]) {
      this.addresses$ = this.store.pipe(select(selectExpiredAddresses));
    } else if (item === this.menuItems[2]) {
      // this.addresses$ = this.store.pipe(select(selectAllAddresses));
    }
  }
}
