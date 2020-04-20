import { Component, OnInit } from '@angular/core';
import { environment } from '@environment';
import * as extensionizer from 'extensionizer';
import { Router } from '@angular/router';
import { WindowService } from './../../../../services';
import { ChangeWalletState, saveWallet } from './../../../../store/actions/wallet.actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-header-popup',
  templateUrl: './header-popup.component.html',
  styleUrls: ['./header-popup.component.scss']
})


export class HeaderPopupComponent implements OnInit {
  isDropdownVisible = false;
  menuItems = [];
  public isFullScreen = false;

  public fullViewIcon = `${environment.assetsPath}/images/shared/components/header-popup/icon-full-view.svg`;
  public exportIcon = `${environment.assetsPath}/images/shared/components/header-popup/ic-share-white.svg`;
  public importIcon = `${environment.assetsPath}/images/shared/components/header-popup/ic-receive-blue.svg`;
  public proofIcon = `${environment.assetsPath}/images/shared/components/header-popup/icon-proof.svg`;
  public buyBeamIcon = `${environment.assetsPath}/images/shared/components/header-popup/icon-where-to-buy-beam.svg`;
  public settingsIcon = `${environment.assetsPath}/images/shared/components/header-popup/icon-settings.svg`;
  public logoutIcon = `${environment.assetsPath}/images/shared/components/menu/icon-logout.svg`;

  constructor(
    private store: Store<any>,
    private windowService: WindowService,
    public router: Router) {
    this.isFullScreen = windowService.isFullSize();
  }

  ngOnInit() {
  }

  changeDropdownState(event) {
    event.stopPropagation();
    this.isDropdownVisible = !this.isDropdownVisible;
  }

  fullViewClicked() {
    if (!this.isFullScreen) {
      const extensionURL = extensionizer.runtime.getURL('index.html#wallet/main');
      extensionizer.tabs.create({ url: extensionURL });
    }
    this.isDropdownVisible = false;
  }

  settingsClicked() {
    this.isDropdownVisible = false;
    this.router.navigate(['/settings/all']);
  }

  logoutClicked() {
    this.store.dispatch(ChangeWalletState({walletState: false}));
    this.store.dispatch(saveWallet({wallet: {}}));
    this.isDropdownVisible = false;
    this.router.navigate(['/wallet/login']);
  }

  paymentProofClicked($event) {
    $event.stopPropagation();
    this.isDropdownVisible = false;
    this.router.navigate([this.router.url, { outlets: { popup: 'payment-proof' }}]);
  }

  buyBeamClicked() {
    this.isDropdownVisible = false;
    window.open('https://beam.mw/#exchanges', '_blank');
  }

  onClickedOutside() {
    this.isDropdownVisible = !this.isDropdownVisible;
  }
}
