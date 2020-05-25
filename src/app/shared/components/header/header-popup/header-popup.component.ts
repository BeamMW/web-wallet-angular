import { Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import { environment } from '@environment';
import * as extensionizer from 'extensionizer';
import { Router } from '@angular/router';
import { WindowService, DataService } from './../../../../services';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import {
  selectPrivacySetting
} from '../../../../store/selectors/wallet-state.selectors';
import {
  updatePrivacySetting
} from './../../../../store/actions/wallet.actions';

@Component({
  selector: 'app-header-popup',
  templateUrl: './header-popup.component.html',
  styleUrls: ['./header-popup.component.scss']
})


export class HeaderPopupComponent implements OnInit {
  isDropdownVisible = false;
  menuItems = [];
  public isFullScreen = false;
  public privacyMode = false;
  privacySetting$: Observable<any>;

  @ViewChild('control', {static: true}) control: ElementRef;

  public fullViewIcon = `${environment.assetsPath}/images/shared/components/header-popup/icon-full-view.svg`;
  public exportIcon = `${environment.assetsPath}/images/shared/components/header-popup/ic-share-white.svg`;
  public importIcon = `${environment.assetsPath}/images/shared/components/header-popup/ic-receive-blue.svg`;
  public proofIcon = `${environment.assetsPath}/images/shared/components/header-popup/icon-proof.svg`;
  public buyBeamIcon = `${environment.assetsPath}/images/shared/components/header-popup/icon-where-to-buy-beam.svg`;
  public settingsIcon = `${environment.assetsPath}/images/shared/components/header-popup/icon-settings.svg`;
  public logoutIcon = `${environment.assetsPath}/images/shared/components/menu/icon-logout.svg`;
  public iconDisabledPrivacy = `${environment.assetsPath}/images/shared/components/header-popup/icn-eye.svg`;
  public iconEnabledPrivacy = `${environment.assetsPath}/images/shared/components/header-popup/icn-eye-crossed.svg`;

  constructor(
    private store: Store<any>,
    private windowService: WindowService,
    private dataService: DataService,
    public router: Router) {
    this.isFullScreen = windowService.isFullSize();

    this.privacySetting$ = this.store.pipe(select(selectPrivacySetting));
    this.privacySetting$.subscribe((state) => {
      this.privacyMode = state;
    });
  }

  ngOnInit() {
  }

  changeDropdownState() {
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
    this.dataService.deactivateWallet();
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

  onClickedOutside(element) {
    const controlClicked = this.control.nativeElement === element || this.control.nativeElement.contains(element);
    if (!controlClicked) {
      this.isDropdownVisible = !this.isDropdownVisible;
    }
  }

  securityModeClicked() {
    this.privacyMode = !this.privacyMode;
    this.store.dispatch(updatePrivacySetting({settingValue: this.privacyMode}));
    this.dataService.saveWalletOptions();
    this.isDropdownVisible = false;
  }
}
