import { Component, OnInit } from '@angular/core';
import {DataService} from '@app/services';
import { Router, NavigationExtras } from '@angular/router';
import { FormGroup} from '@angular/forms';
import { Subscription, Observable, from } from 'rxjs';
import { environment } from '@environment';
import { routes, globalConsts } from '@consts';
import { Store, select } from '@ngrx/store';
import {
  selectPasswordCheckSetting,
} from '@app/store/selectors/wallet-state.selectors';

@Component({
  selector: 'app-send-confirmation',
  templateUrl: './send-confirmation.component.html',
  styleUrls: ['./send-confirmation.component.scss']
})
export class SendConfirmationComponent implements OnInit {
  public iconBack: string = `${environment.assetsPath}/images/modules/send/containers/send-addresses/icon-back.svg`;
  sendForm: FormGroup;
  sub: Subscription;
  public sendData = {
    address: '',
    fee: 0,
    comment: '',
    amount: 0
  };
  popupOpened = false;
  isPassCheckEnabled = false;
  passwordCheckSetting$: Observable<any>;

  constructor(private dataService: DataService,
              private store: Store<any>,
              public router: Router) {
    dataService.changeEmitted$.subscribe(emittedState => {
      this.popupOpened = emittedState;
    });

    this.passwordCheckSetting$ = this.store.pipe(select(selectPasswordCheckSetting));
    this.passwordCheckSetting$.subscribe(settingValue => {
      this.isPassCheckEnabled = settingValue;
    }).unsubscribe();

    try {
      const navigation = this.router.getCurrentNavigation();
      const state = navigation.extras.state as {
        address: string,
        fee: number,
        amount: number,
        comment: string
      };
      this.sendData.address = state.address;
      this.sendData.fee = state.fee === undefined || state.fee === 0 ? 100000 : state.fee;
      this.sendData.amount = state.amount;
      this.sendData.comment = state.comment;
    } catch (e) {
      this.router.navigate([routes.SEND_ADDRESSES_ROUTE]);
    }
  }

  submit($event) {
    $event.stopPropagation();
    if (this.isPassCheckEnabled) {
      const navigationExtras: NavigationExtras = {
        state: {
          address: this.sendData.address,
          fee: this.sendData.fee,
          comment: this.sendData.comment,
          amount: this.sendData.amount * globalConsts.GROTHS_IN_BEAM,
          isPassCheckEnabled: true
        }
      };
      this.router.navigate([this.router.url, { outlets: { popup: 'confirm-popup' }}], navigationExtras);
    } else {
      this.dataService.transactionSend({
        fee: this.sendData.fee,
        address: this.sendData.address,
        comment: this.sendData.comment,
        amount: this.sendData.amount * globalConsts.GROTHS_IN_BEAM
      });
    }
  }

  ngOnInit() {
  }

  backAmountClicked() {
    const navigationExtras: NavigationExtras = {
      state: this.sendData
    };
    this.router.navigate([routes.SEND_AMOUNT_ROUTE], navigationExtras);
  }
}
