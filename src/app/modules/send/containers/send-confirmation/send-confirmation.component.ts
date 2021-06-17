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
import Big from 'big.js';

@Component({
  selector: 'app-send-confirmation',
  templateUrl: './send-confirmation.component.html',
  styleUrls: ['./send-confirmation.component.scss']
})
export class SendConfirmationComponent implements OnInit {
  public iconBack: string = `${environment.assetsPath}/images/modules/send/containers/send-addresses/icon-back.svg`;
  public sendForm: FormGroup;
  public sendData = {
    address: '',
    fee: 0,
    comment: '',
    amount: new Big(0),
    asset_id: 0,
    offline: false
  };
  popupOpened = false;
  isPassCheckEnabled = false;
  passwordCheckSetting$: Observable<any>;
  public componentParams = {
    sendClicked: false
  }
  public feeString = '';
  public typeString = '';
  public unitName = '';
  public amountValue = 0;
  public remaining = 0;
  public change = 0;

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
        comment: string,
        change: number,
        remaining: number,
        asset_id: number,
        offline: boolean,
        type: string,
        unit_name: string
      };
      this.sendData.address = state.address;
      this.sendData.fee = state.fee;
      this.feeString = (new Big(state.fee).div(globalConsts.GROTHS_IN_BEAM)).toFixed();
      this.amountValue = (new Big(state.amount).div(globalConsts.GROTHS_IN_BEAM)).toFixed();
      this.typeString = state.type;
      this.unitName = state.unit_name;
      this.sendData.amount = new Big(state.amount);
      this.sendData.comment = state.comment;
      this.change = state.change;
      this.sendData.asset_id = state.asset_id;
      this.sendData.offline = state.offline;
      this.remaining = state.remaining;
    } catch (e) {
      this.router.navigate([routes.SEND_ADDRESSES_ROUTE]);
    }
  }
  
  submit($event) {
    $event.stopPropagation();

    if (!this.componentParams.sendClicked) {
      this.dataService.transactionSend(this.sendData);
      this.componentParams.sendClicked = true;
    }
  }

  ngOnInit() {
  }

  backAmountClicked() {
    // const navigationExtras: NavigationExtras = {
    //   state: {
    //     address: this.sendData.address,
    //     amount: (this.sendData.amount.div(globalConsts.GROTHS_IN_BEAM)).toFixed()
    //   }
    // };
    this.router.navigate([routes.SEND_ADDRESSES_ROUTE]);//, navigationExtras);
  }
}
