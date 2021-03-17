import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { environment } from '@environment';
import { DataService, WindowService } from '@app/services';
import { Store, select } from '@ngrx/store';
import {
  selectPasswordCheckSetting,
  selectWalletStatus,
  selectSendData
} from '@app/store/selectors/wallet-state.selectors';
import { WasmService } from '@app/services/wasm.service';
import { debounceTime } from 'rxjs/operators';
import { globalConsts, rpcMethodIdsConsts, routes } from '@consts';
import Big from 'big.js';
import { selectAvailableUtxo } from '@app/store/selectors/utxo.selectors';

@Component({
  selector: 'app-send-addresses',
  templateUrl: './send-addresses.component.html',
  styleUrls: ['./send-addresses.component.scss']
})
export class SendAddressesComponent implements OnInit, OnDestroy {
  public iconBack: string = `${environment.assetsPath}/images/modules/send/containers/send-addresses/icon-back.svg`;
  public arrowIcon: string = `${environment.assetsPath}/images/modules/send/containers/send-addresses/arrow.svg`;

  sendForm: FormGroup;
  fullSendForm: FormGroup;
  walletStatus$: Observable<any>;
  sendFrom: string;
  passwordCheckSetting$: Observable<any>;
  utxos$: Observable<any>;
  sendData$: Observable<any>;
  private isPassCheckEnabled = false;

  localParams = {
    prevFee: 0,
    addressValidation: true,
    isAddressInputValid: false,
    amountValidated: false,
    minFeeIsNotCorrect: false,
    feeIsCorrect: true,
    isNotEnoughAmount: false,
    notEnoughtValue: 0,
    popupOpened: false,
    isSendDataValid: false,
    isFullScreen: false,
  };

  private subManager = {
    sub: new Subscription(),
    changeSub: new Subscription(),
    defChangeSub: new Subscription(),
  };

  stats = {
    totalUtxo: new Big(0),
    amountToSend: new Big(0),
    change: new Big(0),
    remaining: new Big(0)
  };

  constructor(private dataService: DataService,
              public router: Router,
              private wasmService: WasmService,
              private store: Store<any>,
              private windowService: WindowService) {
    this.utxos$ = this.store.pipe(select(selectAvailableUtxo));
    this.walletStatus$ = this.store.pipe(select(selectWalletStatus));
    this.localParams.isFullScreen = windowService.isFullSize();
    this.passwordCheckSetting$ = this.store.pipe(select(selectPasswordCheckSetting));
    this.passwordCheckSetting$.subscribe(settingValue => {
      this.isPassCheckEnabled = settingValue;
    }).unsubscribe();

    let address = '';
    try {
      const navigation = this.router.getCurrentNavigation();
      const state = navigation.extras.state as {
        address: string,
      };
      address = state.address;
    } catch (e) {}

    this.sendForm = new FormGroup({
      address: new FormControl(address,  [
        Validators.required
      ])
    });

    this.fullSendForm = new FormGroup({
      address: new FormControl('',  [
        Validators.required
      ]),
      fee: new FormControl(globalConsts.MIN_FEE_VALUE, [
        Validators.required
      ]),
      comment: new FormControl(''),
      amount: new FormControl('', [
        Validators.required
      ])
    });

    this.subManager.sub = dataService.changeEmitted$.subscribe(emittedState => {
      this.localParams.popupOpened = emittedState;
    });
    this.sendData$ = this.store.pipe(select(selectSendData));
  }

  submit() {
    if (this.localParams.isAddressInputValid) {
      const navigationExtras: NavigationExtras = {state: {address: this.sendForm.value.address}};
      this.router.navigate([routes.SEND_AMOUNT_ROUTE], navigationExtras);
    }
  }

  fullSubmit($event) {
    $event.stopPropagation();
    if (this.localParams.feeIsCorrect &&
          this.localParams.isSendDataValid) {
      const navigationExtras: NavigationExtras = {
        state: {
          address: this.fullSendForm.value.address,
          fee: this.fullSendForm.value.fee,
          comment: this.fullSendForm.value.comment,
          amount: parseInt((new Big(this.fullSendForm.value.amount).times(globalConsts.GROTHS_IN_BEAM)).toFixed(), 10),
          isPassCheckEnabled: this.isPassCheckEnabled
        }
      };
      this.router.navigate([this.router.url, { outlets: { popup: 'confirm-popup' }}], navigationExtras);
    }
  }

  ngOnInit() {
    if (this.sendForm.value.address.length > 0) {
      this.addressInputUpdated(this.sendForm.value.address);
    }

    if (this.localParams.isFullScreen) {
      this.fullSendForm.get('amount').valueChanges.pipe(debounceTime(300)).subscribe(newValue => {
        this.amountChanged(newValue);
      });

      this.fullSendForm.get('fee').valueChanges.pipe(debounceTime(300)).subscribe(newValue => {
        this.feeChanged(newValue);
      });
      this.getSmallestUtxo();
    }
  }

  getSmallestUtxo() {
    this.resetStats();
    this.utxos$.subscribe(utxos => {
      if (utxos.length > 0) {
        const sortedUtxo = utxos.sort((a, b) => {
          return a.amount - b.amount;
        });

        const smallestUtxoAmount = sortedUtxo[0].amount;
        this.stats.totalUtxo = new Big(smallestUtxoAmount).plus(100000);

        this.subManager.defChangeSub = this.wasmService.wallet.subscribe((r)=> {
          const respone = JSON.parse(r);

          if (respone.result && respone.id === rpcMethodIdsConsts.CHANGE_PASSWORD_ID) {
            // if (this.subManager.defChangeSub !== undefined) {
            //   this.subManager.defChangeSub.unsubscribe();
            // }

            const change = parseFloat(respone.result.change);
            this.stats.totalUtxo = new Big(smallestUtxoAmount).div(globalConsts.GROTHS_IN_BEAM);
            this.stats.amountToSend = new Big(0);
            this.stats.change = new Big(change).div(globalConsts.GROTHS_IN_BEAM);
            this.stats.remaining = 0;
          }
        });

        this.wasmService.wallet.sendRequest(JSON.stringify({
          jsonrpc: '2.0',
          id: rpcMethodIdsConsts.CALC_CHANGE_ID,
          method: 'calc_change',
          params:
          {
            amount: parseFloat(this.fullSendForm.value.fee),
          }
        }));
      }
    }).unsubscribe();
  }

  ngOnDestroy() {
    this.subManager.sub.unsubscribe();
  }

  backConfirmationClicked() {
    this.router.navigate([routes.WALLET_MAIN_ROUTE]);
  }

  addAllClicked($event) {
    this.walletStatus$.subscribe((status) => {
      if (status.available > 0 && status.available > this.fullSendForm.value.fee) {
        const allAmount = (new Big(status.available).minus(this.fullSendForm.value.fee)).div(globalConsts.GROTHS_IN_BEAM);
        this.amountChanged(allAmount.toFixed());
        this.addressInputCheck();
        this.localParams.isFullScreen ?
        this.fullSendForm.get('amount').setValue(allAmount.toFixed()) :
          this.sendForm.get('amount').setValue(allAmount.toFixed());
      }
    }).unsubscribe();
  }

  outgoingClicked($event) {
    $event.stopPropagation();
  }

  feeValidationCheck() {
    this.localParams.feeIsCorrect = !this.localParams.minFeeIsNotCorrect;
  }

  feeChanged(fee) {
    this.localParams.minFeeIsNotCorrect = fee.length === 0 || parseInt(fee, 10) < globalConsts.MIN_FEE_VALUE;
    this.amountChanged(this.fullSendForm.value.amount);
    this.feeValidationCheck();
    this.valuesValidationCheck();
  }

  amountChanged(amountInputValue) {
    this.resetStats();
    this.walletStatus$.subscribe((status) => {
      const feeFullValue = new Big(this.fullSendForm.value.fee).div(globalConsts.GROTHS_IN_BEAM);
      const available = new Big(status.available).div(globalConsts.GROTHS_IN_BEAM);
      const amount = parseFloat(amountInputValue.length > 0 ? amountInputValue : 0);
      const bigAmount = new Big(amount);
      this.stats.amountToSend = new Big(amount);
      if (amount > 0) {
        if (status.available > 0) {
          if (parseFloat(bigAmount.plus(feeFullValue)) > parseFloat(available)) {
            this.localParams.isNotEnoughAmount = true;
            this.localParams.notEnoughtValue = bigAmount.plus(feeFullValue);
            this.stats.remaining = new Big(0);
            this.stats.change = new Big(0);
            this.stats.totalUtxo = this.stats.amountToSend.plus(feeFullValue);
            this.localParams.amountValidated = false;
          } else {
            this.localParams.isNotEnoughAmount = false;
            this.localParams.amountValidated = true;
          }

          if (!this.localParams.isNotEnoughAmount) {

            this.subManager.defChangeSub = this.wasmService.wallet.subscribe((r)=> {
              const respone = JSON.parse(r);
            
              if (respone.result && respone.id === rpcMethodIdsConsts.CALC_CHANGE_ID) {
                this.subManager.changeSub.unsubscribe();

                const change = parseFloat(respone.result.change);
                if (change > 0) {
                  this.stats.change = new Big(change).div(globalConsts.GROTHS_IN_BEAM);
                  this.stats.totalUtxo = this.stats.amountToSend.plus(feeFullValue).plus(this.stats.change);
                  this.stats.remaining = available.minus(this.stats.amountToSend).minus(this.stats.change);
                  this.localParams.amountValidated = true;
                } else {
                  this.stats.totalUtxo = this.stats.amountToSend.plus(feeFullValue);
                }
                this.valuesValidationCheck();
              }
            });

            this.wasmService.wallet.sendRequest(JSON.stringify({
              jsonrpc: '2.0',
              id: rpcMethodIdsConsts.CHANGE_PASSWORD_ID,
              method: 'calc_change',
              params:
              {
                amount: parseFloat(bigAmount
                  .times(globalConsts.GROTHS_IN_BEAM)
                  .plus(this.fullSendForm.value.fee)),
              }
            }));
          }
        } else {
          this.resetStats();
          this.localParams.isNotEnoughAmount = true;
          this.stats.totalUtxo = new Big(this.stats.amountToSend.plus(feeFullValue));
          this.localParams.notEnoughtValue = bigAmount.plus(feeFullValue);
          this.localParams.amountValidated = false;
        }
      } else {
        if (this.fullSendForm.value.fee === 0 ||
            parseInt(this.fullSendForm.value.fee, 10) > status.available) {
          this.resetStats();
          this.localParams.isNotEnoughAmount = true;
          this.stats.amountToSend = new Big(0);
          this.stats.totalUtxo = feeFullValue;
          this.localParams.notEnoughtValue = feeFullValue.minus(available);
          this.localParams.amountValidated = false;
        } else {
          this.localParams.isNotEnoughAmount = false;
          this.localParams.amountValidated = false;
          this.getSmallestUtxo();
        }
      }
    }).unsubscribe();
    this.valuesValidationCheck();
  }

  resetStats() {
    this.stats.totalUtxo = new Big(0);
    this.stats.amountToSend = new Big(0);
    this.stats.change = new Big(0);
    this.stats.remaining = new Big(0);
  }

  addressInputUpdated(value) {
    //const tokenJson = this.wasmService.convertTokenToJson(value);
    // if (value.length > 0 && tokenJson.length > 0) {
    //   const tokenData = JSON.parse(tokenJson);
    //   if (tokenData.params !== undefined &&
    //       tokenData.params.PeerWalletIdentity !== undefined &&
    //       tokenData.params.PeerID !== undefined) {
    //     if (tokenData.params.Amount !== undefined) {
    //       const amountFromToken = new Big(tokenData.params.Amount).div(globalConsts.GROTHS_IN_BEAM);
    //       this.fullSendForm.get('amount').setValue(amountFromToken.toFixed());
    //       this.amountChanged(amountFromToken.toFixed());
    //     }
    //     this.localParams.addressValidation = true;
    //   } else {
    //     this.localParams.addressValidation = false;
    //   }
    // } else 
    
    if (value.length > 0) { //&& tokenJson.length === 0
      this.localParams.addressValidation = true;
    } else {
      this.localParams.addressValidation = false;
    }

    this.addressInputCheck();
    this.valuesValidationCheck();
  }

  addressInputCheck() {
    this.localParams.isAddressInputValid = (this.sendForm.value.address.length > 0 ||
      this.fullSendForm.value.address.length > 0) &&
      this.localParams.addressValidation;
  }

  valuesValidationCheck() {
    this.localParams.isSendDataValid = this.localParams.amountValidated &&
      this.localParams.feeIsCorrect &&
      this.localParams.isAddressInputValid &&
      this.localParams.addressValidation &&
      !this.localParams.isNotEnoughAmount;
  }
}
