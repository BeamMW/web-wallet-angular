import { Component, OnInit } from '@angular/core';
import { environment } from '@environment';
import { Router } from '@angular/router';
import { MatSlideToggleChange } from '@angular/material';
import { Store, select } from '@ngrx/store';
import {
  updatePasswordCheckSetting,
} from './../../../../store/actions/wallet.actions';
import { routes } from '@app/consts';
import { Observable } from 'rxjs';
import {
  selectPasswordCheckSetting
} from '../../../../store/selectors/wallet-state.selectors';
import { DataService } from './../../../../services';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss']
})
export class PrivacyComponent implements OnInit {
  public iconBack: string = `${environment.assetsPath}/images/modules/send/containers/send-addresses/icon-back.svg`;
  isCheckedPassword = true;
  checkPasswordSetting$: Observable<any>;
  popupOpened = false;

  constructor(
    private store: Store<any>,
    public router: Router,
    private dataService: DataService
  ) {
    this.checkPasswordSetting$ = this.store.pipe(select(selectPasswordCheckSetting));
    this.checkPasswordSetting$.subscribe((state) => {
      this.isCheckedPassword = state;
    });

    dataService.changeEmitted$.subscribe(emittedState => {
      if (emittedState.popupOpened !== undefined) {
        this.popupOpened = emittedState.popupOpened;
      }
    });
  }

  ngOnInit() {
  }

  backClicked(event) {
    event.stopPropagation();
    this.router.navigate([routes.SETTINGS_ALL_ROUTE]);
  }

  public checkPasswordToggle(event: MatSlideToggleChange) {
    this.store.dispatch(updatePasswordCheckSetting({settingValue: event.checked}));
    this.router.navigate([this.router.url, { outlets: { popup: 'check-pass-confirmation-popup'}}]);
  }

  public completeVerificationClicked($event) {
    $event.stopPropagation();
    this.router.navigate([this.router.url, { outlets: { popup: 'seed-verification-popup' }}]);
  }

  public changePasswordClicked($event) {
    $event.stopPropagation();
    this.router.navigate([this.router.url, { outlets: { popup: 'change-pass-popup' }}]);
  }
}
