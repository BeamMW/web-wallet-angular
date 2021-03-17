import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  selectAvailableUtxo,
  selectInProgressUtxo,
  selectSpentUtxo,
  selectUnavailableUtxo } from '@app/store/selectors/utxo.selectors';
import {
  selectWalletStatus,
  selectPrivacySetting } from '@app/store/selectors/wallet-state.selectors';
import { 
  DataService, 
  WindowService } from '@app/services';
import {
  updatePrivacySetting } from '@app/store/actions/wallet.actions';
import { environment } from '@environment';

export enum selectorTitles {
  AVAILABLE = 'Available',
  IN_PROGRESS = 'In progress',
  SPENT = 'Spent',
  UNAVAILABLE = 'Unavailable'
}

@Component({
  selector: 'app-utxo-main',
  templateUrl: './utxo-main.component.html',
  styleUrls: ['./utxo-main.component.scss']
})
export class UtxoMainComponent implements OnInit {
  public iconMenu: string = `${environment.assetsPath}/images/modules/wallet/containers/main/icon-menu.svg`;
  public iconEmpty: string = `${environment.assetsPath}/images/modules/utxo/containers/utxo-main/icon-utxo-empty-state.svg`;
  public iconSecure: string = `${environment.assetsPath}/images/modules/utxo/containers/utxo-main/icn-eye-crossed.svg`;
  public iconDisabledPrivacy: string = `${environment.assetsPath}/images/modules/wallet/containers/main/icn-eye.svg`;
  public iconEnabledPrivacy: string = `${environment.assetsPath}/images/modules/wallet/containers/main/icn-eye-crossed.svg`;
  public iconDrop: string = `${environment.assetsPath}/images/modules/addresses/components/address-type-menu/arrow.svg`;

  public tableType = 'utxo';
  public tableColumns = ['utxo_amount', 'utxo_maturity', 'utxo_type', 'utxo_status'];

  public selectorTitlesData = selectorTitles;
  public utxoSelectorActiveTitle = selectorTitles.AVAILABLE;

  walletStatus$: Observable<any>;
  utxos$: Observable<any>;
  privacySetting$: Observable<any>;
  isFullSize = false;
  privacyMode = false;
  popupOpened = false;
  modalOpened = false;
  isDropdownVisible = false;

  constructor(private store: Store<any>,
              public router: Router,
              private windowService: WindowService,
              private dataService: DataService) {
    this.isFullSize = this.windowService.isFullSize();
    this.walletStatus$ = this.store.pipe(select(selectWalletStatus));
    this.utxos$ = this.store.pipe(select(selectAvailableUtxo));

    this.privacySetting$ = this.store.pipe(select(selectPrivacySetting));

    this.privacySetting$.subscribe((state) => {
      this.privacyMode = state;
    });

    dataService.changeEmitted$.subscribe(emittedState => {
      if (emittedState.popupOpened !== undefined) {
        this.popupOpened = emittedState.popupOpened;
      } else {
        this.modalOpened = emittedState;
      }
    });
  }

  ngOnInit() {
  }

  sideMenuClicked(event) {
    event.stopPropagation();
    this.router.navigate([this.router.url, { outlets: { sidemenu: 'menu' }}]);
  }

  privacyControlClicked() {
    this.privacyMode = !this.privacyMode;
    this.store.dispatch(updatePrivacySetting({settingValue: this.privacyMode}));
    this.dataService.saveWalletOptions();
  }

  public selectorItemAvailableClicked() {
    this.utxos$ = this.store.pipe(select(selectAvailableUtxo));
    this.utxoSelectorActiveTitle = selectorTitles.AVAILABLE;
    this.isDropdownVisible = false;
  }

  public selectorItemInProgressClicked() {
    this.utxos$ = this.store.pipe(select(selectInProgressUtxo));
    this.utxoSelectorActiveTitle = selectorTitles.IN_PROGRESS;
    this.isDropdownVisible = false;
  }

  public selectorItemSpentClicked() {
    this.utxos$ = this.store.pipe(select(selectSpentUtxo));
    this.utxoSelectorActiveTitle = selectorTitles.SPENT;
    this.isDropdownVisible = false;
  }

  public selectorItemUnavailableClicked() {
    this.utxos$ = this.store.pipe(select(selectUnavailableUtxo));
    this.utxoSelectorActiveTitle = selectorTitles.UNAVAILABLE;
    this.isDropdownVisible = false;
  }

  onClickedOutside() {
    this.isDropdownVisible = !this.isDropdownVisible;
  }

  changeDropdownState(event) {
    event.stopPropagation();
    this.isDropdownVisible = !this.isDropdownVisible;
  }
}
