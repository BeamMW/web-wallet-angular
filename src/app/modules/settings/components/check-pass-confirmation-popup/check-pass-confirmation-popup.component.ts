import { Component, OnInit, OnDestroy } from '@angular/core';
import {Router} from '@angular/router';
import { ActivatedRoute} from '@angular/router';
import { DataService, WindowService } from './../../../../services';
import { Subscription, Observable } from 'rxjs';
import { FormGroup, FormControl} from '@angular/forms';
import * as passworder from 'browser-passworder';
import { Store, select } from '@ngrx/store';
import { selectWalletData } from './../../../../store/selectors/wallet-state.selectors';
import {
  selectPasswordCheckSetting
} from '../../../../store/selectors/wallet-state.selectors';
import {
  updatePasswordCheckSetting,
} from './../../../../store/actions/wallet.actions';

@Component({
  selector: 'app-check-pass-confirmation-popup',
  templateUrl: './check-pass-confirmation-popup.component.html',
  styleUrls: ['./check-pass-confirmation-popup.component.scss']
})
export class CheckPassConfirmationPopupComponent implements OnInit, OnDestroy {
  wallet$: Observable<any>;
  sub: Subscription;
  confirmForm: FormGroup;
  isFullScreen = false;
  isCorrectPass = true;
  checkPasswordSetting$: Observable<any>;
  isCheckedPassword = null;

  constructor(private windowSerivce: WindowService,
              public router: Router,
              private activatedRoute: ActivatedRoute,
              private store: Store<any>,
              private dataService: DataService) {
    this.isFullScreen = windowSerivce.isFullSize();
    this.confirmForm = new FormGroup({
      password: new FormControl()
    });
    this.wallet$ = this.store.pipe(select(selectWalletData));
    this.checkPasswordSetting$ = this.store.pipe(select(selectPasswordCheckSetting));

    this.checkPasswordSetting$.subscribe((state) => {
      this.isCheckedPassword = state;
    });
  }

  ngOnInit() {
    this.dataService.emitChange({popupOpened: true});
  }

  ngOnDestroy() {
    this.dataService.emitChange({popupOpened: false});
    if (this.sub !== undefined) {
      this.sub.unsubscribe();
    }
  }

  submit($event) {
    this.wallet$.subscribe(wallet => {
      passworder.decrypt(this.confirmForm.value.password, wallet).then((result) => {
        this.dataService.saveWalletOptions();
        this.closePopup(true);
      }).catch(error => {
        this.isCorrectPass = false;
      });
    });
  }

  cancelClicked($event) {
    $event.stopPropagation();
    this.closePopup();
  }

  closePopup(isCorrect = false) {
    if (isCorrect) {
      this.dataService.saveWalletOptions();
    } else {
      this.store.dispatch(updatePasswordCheckSetting({settingValue: !this.isCheckedPassword}));
    }
    this.router.navigate([{ outlets: { popup: null }}], {relativeTo: this.activatedRoute.parent});
  }
}
