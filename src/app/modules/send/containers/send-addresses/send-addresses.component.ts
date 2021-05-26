import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { environment } from '@environment';
import { DataService, WindowService } from '@app/services';
import { Store, select } from '@ngrx/store';
import { loadAddressValidation } from '@app/store/actions/wallet.actions';
import {
  selectPasswordCheckSetting,
  selectWalletStatus,
  selectSendData,
  selectAddressValidationData
} from '@app/store/selectors/wallet-state.selectors';
import { WasmService } from '@app/services/wasm.service';
import { debounceTime } from 'rxjs/operators';
import { globalConsts, rpcMethodIdsConsts, routes } from '@consts';
import { selectAvailableUtxo } from '@app/store/selectors/utxo.selectors';
//import { selectAddressValidationData } from '@app/store/selectors/address.selectors';
import Big from 'big.js';

@Component({
  selector: 'app-send-addresses',
  templateUrl: './send-addresses.component.html',
  styleUrls: ['./send-addresses.component.scss']
})
export class SendAddressesComponent implements OnInit, OnDestroy {
  public iconBack: string = `${environment.assetsPath}/images/modules/send/containers/send-addresses/icon-back.svg`;
  public arrowIcon: string = `${environment.assetsPath}/images/modules/send/containers/send-addresses/arrow.svg`;

  private addressTypes = {
    'regular': {
      name: 'Regular address'
    },
    'regular_new': {
      name: 'Regular address'
    },
    'max_privacy': {
      name: 'Max privacy address'
    },
    'offline': {
      name: 'Offline address'
    }
  };

  sendForm: FormGroup;
  fullSendForm: FormGroup;
  walletStatus$: Observable<any>;
  sendFrom: string;
  passwordCheckSetting$: Observable<any>;
  utxos$: Observable<any>;
  addressValidation$: Observable<any>;
  sendData$: Observable<any>;
  private isPassCheckEnabled = false;

  private ratesData: any;

  public componentParams = {
    iconBeam: `${environment.assetsPath}/images/modules/receive/containers/receive/icon-beam.svg`,
    iconArrowDown: `${environment.assetsPath}/images/modules/receive/containers/receive/icon-arrow-down.svg`,
    iconArrowUp: `${environment.assetsPath}/images/modules/receive/containers/receive/icon-arrow-up.svg`,
    iconButtonArrowUp: `${environment.assetsPath}/images/modules/send/containers/send-addresses/icon-send-blue.svg`,
    prevFee: 0,
    addressValidation: true,
    isAddressInputValid: false,
    amountValidated: false,
    minFeeIsNotCorrect: false,
    feeIsCorrect: true,
    isEnoughAmount: true,
    notEnoughtValue: 0,
    popupOpened: false,
    isSendDataValid: false,
    isFullScreen: false,
    backLink: routes.WALLET_MAIN_ROUTE,
    titleText: 'Wallet',
    subtitleText: 'SEND',
    amountInUSD: 0,
    commentExpanded: false,
    feeExpanded: false,
    validationResult: ''
  };

  private subManager = {
    sub: new Subscription(),
    changeSub: new Subscription(),
    defChangeSub: new Subscription(),
    statusSub: new Subscription()
  };

  public stats = {
    amountToSend: new Big(0),
    change: new Big(0),
    remaining: new Big(0),
    fee: new Big(0)
  };

  constructor(private dataService: DataService,
              public router: Router,
              private wasmService: WasmService,
              private store: Store<any>,
              private windowService: WindowService) {
    this.utxos$ = this.store.pipe(select(selectAvailableUtxo));
    this.walletStatus$ = this.store.pipe(select(selectWalletStatus));
    this.componentParams.isFullScreen = windowService.isFullSize();
    this.passwordCheckSetting$ = this.store.pipe(select(selectPasswordCheckSetting));
    this.addressValidation$ = this.store.pipe(select(selectAddressValidationData));
    this.passwordCheckSetting$.subscribe(settingValue => {
      this.isPassCheckEnabled = settingValue;
    }).unsubscribe();

    this.addressValidation$.subscribe(value => {
      if (value) {
        this.componentParams.validationResult = this.addressTypes[value.type].name;
      }
    });

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
      this.componentParams.popupOpened = emittedState;
    });
    this.sendData$ = this.store.pipe(select(selectSendData));
  }

  submit() {
    if (this.componentParams.feeIsCorrect && this.componentParams.isSendDataValid) {
      const navigationExtras: NavigationExtras = {
        state: {
          address: this.sendForm.value.address,
          fee: this.sendForm.value.fee,
          amount: typeof this.sendForm.value.amount === 'string' ? this.sendForm.value.amount : this.sendForm.value.amount.toFixed(),
          comment: this.sendForm.value.comment,
          change: this.stats.change.toFixed(),
          remaining: this.stats.remaining.toFixed()
        }
      };
      this.router.navigate([routes.SEND_CONFIRMATION_ROUTE], navigationExtras);
    }
  }

  fullSubmit($event) {
    $event.stopPropagation();
    if (this.componentParams.feeIsCorrect && this.componentParams.isSendDataValid) {
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

    this.subManager.statusSub = this.walletStatus$.subscribe((status) => {
      const feeFullValue = new Big(this.fullSendForm.value.fee).div(globalConsts.GROTHS_IN_BEAM);
      const available = new Big(status.totals[0].available).div(globalConsts.GROTHS_IN_BEAM);
      this.stats.remaining = available.minus(feeFullValue);
    });

    this.fullSendForm.get('amount').valueChanges.pipe(debounceTime(300)).subscribe(newValue => {
      this.amountChanged(newValue);
    });

    this.fullSendForm.get('fee').valueChanges.pipe(debounceTime(300)).subscribe(newValue => {
      this.feeChanged(newValue);
    });
  }

  // getSmallestUtxo() {
  //   this.resetStats();
  //   this.utxos$.subscribe(utxos => {
  //     if (utxos.length > 0) {
  //       this.subManager.defChangeSub = this.wasmService.wallet.subscribe((r)=> {
  //         const response = JSON.parse(r);
  //         if (response.result && response.id === rpcMethodIdsConsts.CALC_CHANGE_ID) {
            
  //           console.log('CHANGE RESULT', response);
            
  //           const change = parseFloat(response.result.change);
  //           this.stats.amountToSend = new Big(0);
  //           this.stats.change = new Big(change).div(globalConsts.GROTHS_IN_BEAM);
  //           this.stats.remaining = new Big(0);
  //           this.stats.fee = new Big(this.fullSendForm.value.fee);
  //         }
  //       });

  //       this.wasmService.wallet.sendRequest(JSON.stringify({
  //         jsonrpc: '2.0',
  //         id: rpcMethodIdsConsts.CALC_CHANGE_ID,
  //         method: 'calc_change',
  //         params:
  //         {
  //           amount: parseFloat(this.fullSendForm.value.fee),
  //         }
  //       }));
  //     }
  //   }).unsubscribe();
  // }

  ngOnDestroy() {
    this.subManager.sub.unsubscribe();
  }

  backConfirmationClicked() {
    this.router.navigate([routes.WALLET_MAIN_ROUTE]);
  }

  addAllClicked($event) {
    this.walletStatus$.subscribe((status) => {
      if (status.totals[0].available > 0 && status.totals[0].available > this.fullSendForm.value.fee) {
        const allAmount = (new Big(status.available).minus(this.fullSendForm.value.fee))
          .div(globalConsts.GROTHS_IN_BEAM);
        this.amountChanged(allAmount.toFixed());
        this.addressInputCheck();
        this.fullSendForm.get('amount').setValue(allAmount.toFixed());
      }
    }).unsubscribe();
  }

  outgoingClicked($event) {
    $event.stopPropagation();
  }

  feeValidationCheck() {
    this.componentParams.feeIsCorrect = !this.componentParams.minFeeIsNotCorrect;
  }

  feeChanged(fee) {
    this.componentParams.minFeeIsNotCorrect = fee.length === 0 || parseInt(fee, 10) < globalConsts.MIN_FEE_VALUE;
    this.amountChanged(this.fullSendForm.value.amount);
    this.feeValidationCheck();
    this.valuesValidationCheck();
  }

  private amountChanged(amountInputValue) {
    this.subManager.statusSub.unsubscribe();
    this.resetStats();
    this.walletStatus$.subscribe((status) => {
      const feeFullValue = new Big(this.fullSendForm.value.fee).div(globalConsts.GROTHS_IN_BEAM);
      const available = new Big(status.available).div(globalConsts.GROTHS_IN_BEAM);
      const amount = parseFloat(amountInputValue.length > 0 ? amountInputValue : 0);
      const bigAmount = new Big(amount);
      this.stats.amountToSend = new Big(amount);
      this.stats.fee = new Big(feeFullValue);
      if (amount > 0) {
        if (status.available > 0) {
          if (parseFloat(bigAmount.plus(feeFullValue)) > parseFloat(available)) {
            this.componentParams.isEnoughAmount = false;
            this.componentParams.notEnoughtValue = bigAmount.plus(feeFullValue);
            this.stats.remaining = new Big(0);
            this.stats.change = new Big(0);
            this.componentParams.amountValidated = false;
          } else {
            this.componentParams.isEnoughAmount = true;
            this.componentParams.amountValidated = true;
          }

          if (this.componentParams.isEnoughAmount) {
            this.subManager.defChangeSub = this.wasmService.wallet.subscribe((r)=> {
              const response = JSON.parse(r);
            
              if (response.result && response.id === rpcMethodIdsConsts.CALC_CHANGE_ID) {
                const change = parseFloat(response.result.change);
                if (change > 0) {
                  this.stats.change = new Big(change).div(globalConsts.GROTHS_IN_BEAM);
                  this.stats.remaining = available.minus(this.stats.amountToSend).minus(feeFullValue);
                  this.componentParams.amountValidated = true;
                }
                this.valuesValidationCheck();
              }
            });

            this.wasmService.wallet.sendRequest(JSON.stringify({
              jsonrpc: '2.0',
              id: rpcMethodIdsConsts.CALC_CHANGE_ID,
              method: 'calc_change',
              params:
              {
                amount: parseFloat(bigAmount
                  .times(globalConsts.GROTHS_IN_BEAM)
                  .plus(this.fullSendForm.value.fee)),
                fee: this.fullSendForm.value.fee
              }
            }));
          }
        } else {
          this.resetStats();
          this.componentParams.isEnoughAmount = false;
          this.componentParams.notEnoughtValue = bigAmount.plus(feeFullValue);
          this.componentParams.amountValidated = false;
        }
      } else {
        if (this.fullSendForm.value.fee === 0 || parseInt(this.fullSendForm.value.fee, 10) > status.available) {
          this.resetStats();
          this.componentParams.isEnoughAmount = false;
          this.componentParams.notEnoughtValue = feeFullValue.minus(available);
          this.componentParams.amountValidated = false;
        } else {
          this.componentParams.isEnoughAmount = true;
          this.componentParams.amountValidated = false;
          //this.getSmallestUtxo();
        }
      }
    }).unsubscribe();
    this.valuesValidationCheck();
  }

  resetStats() {
    this.stats.amountToSend = new Big(0);
    this.stats.change = new Big(0);
    this.stats.remaining = new Big(0);
    this.stats.fee = new Big(0);
  }

  public addressInputUpdated(value: string) {
    this.store.dispatch(loadAddressValidation({address: value}));

    // if (value.length > 0) {
    //   //this.dataService.validateAddress(value);
    //   this.componentParams.addressValidation = true;
    // } else {
    //   this.componentParams.addressValidation = false;
    // }

    this.addressInputCheck();
    this.valuesValidationCheck();
  }

  addressInputCheck() {
    this.componentParams.isAddressInputValid = (this.sendForm.value.address.length > 0 ||
      this.fullSendForm.value.address.length > 0) &&
      this.componentParams.addressValidation;
  }

  valuesValidationCheck() {
    this.componentParams.isSendDataValid = this.componentParams.amountValidated &&
      this.componentParams.feeIsCorrect &&
      this.componentParams.isAddressInputValid &&
      this.componentParams.addressValidation &&
      this.componentParams.isEnoughAmount;
  }

  public commentControlClicked() {
    this.componentParams.commentExpanded = !this.componentParams.commentExpanded;
  }

  public feeControlClicked() {
    this.componentParams.feeExpanded = !this.componentParams.feeExpanded;
  }
}
