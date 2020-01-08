import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from '@environment';
import { Router } from '@angular/router';
import { DataService } from './../../../../services/data.service';
import { WebsocketService } from './../../../websocket';
import { Store, select } from '@ngrx/store';
import { loadAddresses } from './../../../../store/actions/wallet.actions';
import { selectAllAddresses, selectExpiredAddresses, selectActiveAddresses } from '../../../../store/selectors/wallet.selectors';
import { Subscription, Observable } from 'rxjs';

@Component({
  selector: 'app-addresses-list',
  templateUrl: './addresses-list.component.html',
  styleUrls: ['./addresses-list.component.scss']
})
export class AddressesListComponent implements OnInit, OnDestroy {
  public iconMenu: string = `${environment.assetsPath}/images/modules/wallet/containers/main/icon-menu.svg`;
  private sub: Subscription;
  private wallet: any;
  private active = false;
  private pageActive = false;
  public modalOpened = false;
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
              public wsService: WebsocketService) {
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
    this.wallet = localStorage.getItem('wallet');
    if (this.wallet === undefined) {
      this.router.navigate(['/initialize/create']);
    }
    this.active = this.dataService.store.getState().active;
    this.pageActive = true;

    if (this.active) {
      this.addressesUpdate();
    } else {
      this.router.navigate(['/wallet/login']);
    }
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
      this.addresses$ = this.store.pipe(select(selectAllAddresses));
    }
  }


  // test() {
  //   this.wsService.send({
  //         jsonrpc:'2.0',
  //         id: 123,
  //         method: 'create_address',
  //         params:
  //         {
  //             expiration : 'never',
  //             comment : 'John Smith'
  //         }
  //     })
  // }

}
