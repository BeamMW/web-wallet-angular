
import { Component, OnInit, OnDestroy } from '@angular/core';
import {Router} from '@angular/router';
import { environment } from '@environment';
import { ActivatedRoute} from '@angular/router';
import { DataService, WindowService } from '@app/services';
import { Subscription, Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import * as passworder from 'browser-passworder';
import { FormGroup, FormControl} from '@angular/forms';
import {
  selectWalletData
} from '@app/store/selectors/wallet-state.selectors';
import { globalConsts } from '@consts';
import Big from 'big.js';

@Component({
  selector: 'app-confirmation-popup',
  templateUrl: './confirmation-popup.component.html',
  styleUrls: ['./confirmation-popup.component.scss']
})
export class ConfirmationPopupComponent implements OnInit, OnDestroy {
  wallet$: Observable<any>;
  confirmForm: FormGroup;

  private sub: Subscription;
  private walletSub: Subscription;
  private subscriptions: Subscription[] = [];

  scrollOffset = 0;
  isFullScreen = false;
  isCorrectPass = true;
  isPassCheckEnabled = false;

  public sendData = {
    address: '',
    fee: new Big(0),
    comment: '',
    amount: new Big(0)
  };
  public contactIcon: string = `${environment.assetsPath}/images/shared/components/table/icon-contact.svg`;

  constructor(private store: Store<any>,
              public router: Router,
              private activatedRoute: ActivatedRoute,
              private windowService: WindowService,
              private dataService: DataService) {
    this.isFullScreen = windowService.isFullSize();
    this.confirmForm = new FormGroup({
      password: new FormControl()
    });
    this.wallet$ = this.store.pipe(select(selectWalletData));

    try {
      const navigation = this.router.getCurrentNavigation();
      const state = navigation.extras.state as {
        address: string,
        fee: number,
        amount: number,
        comment: string,
        isPassCheckEnabled: boolean
      };
      this.sendData.address = state.address;
      this.sendData.fee = new Big(state.fee === undefined || state.fee === 0 ? 100000 : state.fee);
      this.sendData.amount = new Big(state.amount);
      this.sendData.comment = state.comment;
      this.isPassCheckEnabled = state.isPassCheckEnabled;
    } catch (e) {}
  }

  ngOnInit() {
    this.dataService.emitChange(true);
    this.scrollOffset = window.pageYOffset;
    window.scroll(0, 0);
    document.body.style.overflowY = 'hidden';
  }

  ngOnDestroy() {
    this.dataService.emitChange(false);
    if (this.sub !== undefined) {
      this.sub.unsubscribe();
    }

    if (this.walletSub !== undefined) {
      this.walletSub.unsubscribe();
    }
    this.subscriptions.forEach(s => s.unsubscribe());
    window.scroll(0, this.scrollOffset);
    document.body.style.overflowY = 'auto';
  }

  submit($event) {
    if (this.isPassCheckEnabled) {
      this.walletSub = this.wallet$.subscribe(wallet => {
        passworder.decrypt(this.confirmForm.value.password, wallet).then((result) => {
          this.dataService.transactionSend(this.sendData);
          this.walletSub.unsubscribe();
        }).catch(error => {
          this.isCorrectPass = false;
        });
      });
    } else {
      this.dataService.transactionSend(this.sendData);
    }
  }

  getTotalUtxo() {
    return ((this.sendData.amount.plus(this.sendData.fee)).div(globalConsts.GROTHS_IN_BEAM)).toFixed();
  }

  cancelClicked($event) {
    $event.stopPropagation();
    this.closePopup();
  }

  closePopup() {
    this.dataService.emitChange(false);
    this.router.navigate([{ outlets: { popup: null }}], {relativeTo: this.activatedRoute.parent});
  }

  passUpdated($event) {
    this.isCorrectPass = true;
  }
}
