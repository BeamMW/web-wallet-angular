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
    fee: 100000,
    comment: '',
    amount: ''
  };
  walletStatus$: Observable<any>;
  sendForm: FormGroup;

  localParams = {
    prevFee: 0,
    amountValidated: false,
    feeIsCorrect: true,
    minFeeIsNotCorrect: false,
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
          amount: typeof this.sendForm.value.amount === 'string' ? this.sendForm.value.amount : this.sendForm.value.amount.toFixed(),
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

  feeValidationCheck() {
    this.localParams.feeIsCorrect = !this.localParams.minFeeIsNotCorrect;
  }

  addAllClicked($event) {
    $event.stopPropagation();
    this.walletStatus$.subscribe((status) => {
      if (status.available > 0 && status.available > this.sendForm.value.fee) {
        const allAmount = (new Big(status.available).minus(this.sendForm.value.fee)).div(globalConsts.GROTHS_IN_BEAM);
        this.amountChanged(allAmount.toFixed());
        this.sendForm.get('amount').setValue(allAmount);
      }
    }).unsubscribe();
  }

  feeChanged(fee) {
    let feeValue = fee.replace(/[^0-9]/g, '');
    feeValue = feeValue.length === 0 ? 0 : feeValue;
    if (parseInt(feeValue, 10) === 0 && feeValue.length > 1) {
      this.sendForm.get('fee').setValue(0);
    } else if (feeValue.length === 0 || parseInt(feeValue, 10) <= 100000000) {
      this.localParams.minFeeIsNotCorrect = feeValue.length === 0 || parseInt(feeValue, 10) < globalConsts.MIN_FEE_VALUE;
      this.sendForm.get('fee').setValue(parseInt(feeValue, 10));
      this.amountChanged(this.sendForm.value.amount);
      this.feeValidationCheck();
      this.localParams.prevFee = feeValue.length !== 0 ? parseInt(feeValue, 10) : 0;
    } else {
      this.sendForm.get('fee').setValue(this.localParams.prevFee);
    }
    this.valuesValidationCheck();
  }

  amountChanged(amountInputValue) {
    this.walletStatus$.subscribe((status) => {
      const feeFullValue = new Big(this.sendForm.value.fee).div(globalConsts.GROTHS_IN_BEAM);
      const available = new Big(status.available).div(globalConsts.GROTHS_IN_BEAM);
      const amount = parseFloat(amountInputValue.length > 0 ? amountInputValue : 0);
      const bigAmount = new Big(amount);
      if (amount > 0) {
        if (status.available > 0) {
          if (parseFloat(bigAmount.plus(feeFullValue)) > parseFloat(available)) {
            this.localParams.isNotEnoughAmount = true;
            this.localParams.notEnoughtValue = bigAmount.plus(feeFullValue);
            this.localParams.amountValidated = false;
          } else {
            this.localParams.isNotEnoughAmount = false;
            this.localParams.amountValidated = true;
          }
        } else {
          this.localParams.isNotEnoughAmount = true;
          this.localParams.notEnoughtValue = bigAmount.plus(feeFullValue);
          this.localParams.amountValidated = false;
        }
      } else {
        if (this.sendForm.value.fee === 0 ||
            parseInt(this.sendForm.value.fee, 10) > status.available) {
          this.localParams.isNotEnoughAmount = true;
          this.localParams.notEnoughtValue = feeFullValue.minus(available);
          this.localParams.amountValidated = false;
        } else {
          this.localParams.isNotEnoughAmount = false;
          this.localParams.amountValidated = false;
        }
      }
    }).unsubscribe();
    this.valuesValidationCheck();
  }

  valuesValidationCheck() {
    this.localParams.isSendDataValid = this.localParams.amountValidated &&
      this.localParams.feeIsCorrect &&
      !this.localParams.isNotEnoughAmount;
  }
}
