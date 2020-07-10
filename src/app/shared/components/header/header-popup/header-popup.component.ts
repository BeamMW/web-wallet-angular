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

  private basePath = `${environment.assetsPath}/images/shared/components/header-popup/`;
  public componentIcons = {
    fullViewIconActive: this.basePath + `icon-full-view-active.svg`,
    fullViewIcon: this.basePath + `icon-full-view.svg`,
    fullViewActualIcon: this.basePath + `icon-full-view.svg`,
    exportIconActive: this.basePath + `icon-export-active.svg`,
    exportIcon: this.basePath + `icon-export.svg`,
    exportActualIcon: this.basePath + `icon-export.svg`,
    importIconActive: this.basePath + `icon-import-active.svg`,
    importIcon: this.basePath + `icon-import.svg`,
    importActualIcon: this.basePath + `icon-import.svg`,
    proofIcon: this.basePath + `icon-proof.svg`,
    proofIconActive: this.basePath + `icon-proof-active.svg`,
    proofActualIcon: this.basePath + `icon-proof.svg`,
    buyBeamIcon: this.basePath + `icon-buy-beam.svg`,
    buyBeamIconActive: this.basePath + `icon-buy-beam-active.svg`,
    buyBeamActualIcon: this.basePath + `icon-buy-beam.svg`,
    settingsIcon: this.basePath + `icon-settings.svg`,
    settingsIconActive: this.basePath + `icon-settings-active.svg`,
    settingsActualIcon: this.basePath + `icon-settings.svg`,
    logoutIcon: this.basePath + `icon-logout.svg`,
    logoutIconActive: this.basePath + `icon-logout-active.svg`,
    logoutActualIcon: this.basePath + `icon-logout.svg`,
    iconDisabledPrivacyActive: this.basePath + `icon-eye-active.svg`,
    iconDisabledPrivacy: this.basePath + `icon-eye.svg`,
    iconDisabledPrivacyActualIcon: this.basePath + `icon-eye.svg`,
    iconEnabledPrivacyActive: this.basePath + `icon-eye-crossed-active.svg`,
    iconEnabledPrivacy: this.basePath + `icon-eye-crossed.svg`,
    iconEnabledPrivacyActualIcon: this.basePath + `icon-eye-crossed.svg`
  };

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

  securityModeMouseout() {
    this.componentIcons.iconDisabledPrivacyActualIcon = this.componentIcons.iconDisabledPrivacy;
    this.componentIcons.iconEnabledPrivacyActualIcon = this.componentIcons.iconEnabledPrivacy;
  }

  securityModeMouseover() {
    this.componentIcons.iconDisabledPrivacyActualIcon = this.componentIcons.iconDisabledPrivacyActive;
    this.componentIcons.iconEnabledPrivacyActualIcon = this.componentIcons.iconEnabledPrivacyActive;
  }
}
