import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { environment } from '@environment';
import { Store, select } from '@ngrx/store';
import { selectWalletStatus } from '../../../../store/selectors/wallet-state.selectors';
import Big from 'big.js';
import { globalConsts, routes } from '@consts';

@Component({
  selector: 'app-send-amount',
  templateUrl: './send-amount.component.html',
  styleUrls: ['./send-amount.component.scss']
})
export class SendAmountComponent implements OnInit {
  public iconBack: string = `${environment.assetsPath}/images/modules/send/containers/send-addresses/icon-back.svg`;
  sendData = {
    address: '',
    fee: 100,
    comment: '',
    amount: ''
  };
  walletStatus$: Observable<any>;
  sendForm: FormGroup;

  localParams = {
    amountValidated: false,
    feeIsCorrect: true,
    isNotEnoughAmount: false,
    notEnoughtValue: 0,
    isSendDataValid: false,
  };

  constructor(public router: Router,
              private store: Store<any>) {
    this.walletStatus$ = this.store.pipe(select(selectWalletStatus));

    try {
      const navigation = this.router.getCurrentNavigation();
      const state = navigation.extras.state as {
        address: string,
      };
      this.sendData.address = state.address;
    } catch (e) {
      this.router.navigate([routes.SEND_ADDRESSES_ROUTE]);
    }

    this.sendForm = new FormGroup({
      fee: new FormControl(this.sendData.fee, [
        Validators.required
      ]),
      comment: new FormControl(this.sendData.comment),
      amount: new FormControl(this.sendData.amount, [
        Validators.required
      ])
    });
  }

  submit() {
    if (this.localParams.isSendDataValid) {
      const navigationExtras: NavigationExtras = {
        state: {
          address: this.sendData.address,
          fee: this.sendForm.value.fee,
          amount: this.sendForm.value.amount,
          comment: this.sendForm.value.comment
        }
      };
      this.router.navigate([routes.SEND_CONFIRMATION_ROUTE], navigationExtras);
    }
  }

  ngOnInit() {
    if (this.sendForm.value.amount !== null && this.sendForm.value.amount.length > 0) {
      this.feeChanged(this.sendForm.value.fee.toString());
      this.amountChanged(this.sendForm.value.amount);
    }
  }

  backAddressesClicked() {
    const navigationExtras: NavigationExtras = {state: {address: this.sendData.address}};
    this.router.navigate([routes.SEND_ADDRESSES_ROUTE], navigationExtras);
  }

  addAllClicked($event) {
    $event.preventDefault();
    this.walletStatus$.subscribe((status) => {
      if (status.available > 0) {
        const allAmount = (status.available - this.sendForm.value.fee) / globalConsts.GROTHS_IN_BEAM;
        this.amountChanged(allAmount);
        this.sendForm.get('amount').setValue(allAmount);
      }
    }).unsubscribe();
  }

  feeChanged(value) {
    const feeValue = value.replace(/[^0-9]/g, '');
    this.localParams.feeIsCorrect = parseInt(feeValue, 10) >= globalConsts.MIN_FEE_VALUE;
    this.sendForm.get('fee').setValue(feeValue);
    this.valuesValidationCheck();
  }

  amountChanged(amountInputValue) {
    this.walletStatus$.subscribe((status) => {
      const feeFullValue = this.sendForm.value.fee / globalConsts.GROTHS_IN_BEAM;
      const available = status.available / globalConsts.GROTHS_IN_BEAM;
      amountInputValue = parseFloat(amountInputValue);

      if ((amountInputValue + feeFullValue) > available) {
        this.localParams.isNotEnoughAmount = true;
        this.localParams.notEnoughtValue = amountInputValue + feeFullValue;
      } else {
        this.localParams.isNotEnoughAmount = false;
      }
    }).unsubscribe();

    this.localParams.amountValidated = amountInputValue > 0;
    this.valuesValidationCheck();
  }

  valuesValidationCheck() {
    this.localParams.isSendDataValid = this.localParams.amountValidated &&
      this.localParams.feeIsCorrect &&
      !this.localParams.isNotEnoughAmount;
  }
}
