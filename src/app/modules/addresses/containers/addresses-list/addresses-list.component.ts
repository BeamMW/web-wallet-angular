import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from '@environment';
import { Router } from '@angular/router';
import { DataService, WindowService } from '@app/services';
import { Store, select } from '@ngrx/store';
import {
  selectExpiredAddresses,
  selectActiveAddresses
} from '@app/store/selectors/address.selectors';
import {
  selectContacts
} from '@app/store/selectors/wallet-state.selectors';
import { Subscription, Observable } from 'rxjs';

@Component({
  selector: 'app-addresses-list',
  templateUrl: './addresses-list.component.html',
  styleUrls: ['./addresses-list.component.scss']
})
export class AddressesListComponent implements OnInit, OnDestroy {
  public iconMenu = `${environment.assetsPath}/images/modules/wallet/containers/main/icon-menu.svg`;
  public iconContactsEmpty = `${environment.assetsPath}/images/modules/addresses/containers/addresses-list/icon-addressbook-empty-state.svg`;

  private sub: Subscription;
  private pageActive = false;
  public modalOpened = false;
  public isFullScreen = false;
  addresses$: Observable<any>;
  public tableType = 'addresses';
  public contactsTableType = 'contacts';
  public tableColumns = ['name', 'address', 'expiration', 'actions'];
  public contactsTableColumns = ['contactName', 'address'];

  public menuItems = [{
    title: 'My active', full: 'My active addresses', id: 0, selected: true
  }, {
    title: 'My expired', full: 'My expired addresses', id: 1, selected: false
  }, {
    title: 'Contacts', full: 'Contacts', id: 2, selected: false
  }];
  public activeSelectorItem = this.menuItems[0];

  constructor(public router: Router,
              public store: Store<any>,
              public dataService: DataService,
              private windowService: WindowService) {
    this.isFullScreen = windowService.isFullSize();
    this.addresses$ = this.store.pipe(select(selectActiveAddresses));
    dataService.changeEmitted$.subscribe(emittedState => {
      this.modalOpened = emittedState;
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
      this.addresses$ = this.store.pipe(select(selectContacts));
    }
  }

  selectorItemClicked(item) {
    this.activeSelectorItem.selected = false;
    item.selected = true;
    this.activeSelectorItem = item;

    if (item.id === this.menuItems[0].id) {
      this.addresses$ = this.store.pipe(select(selectActiveAddresses));
    } else if (item.id === this.menuItems[1].id) {
      this.addresses$ = this.store.pipe(select(selectExpiredAddresses));
    } else if (item.id === this.menuItems[2].id) {
      this.addresses$ = this.store.pipe(select(selectContacts));
    }
  }
}
