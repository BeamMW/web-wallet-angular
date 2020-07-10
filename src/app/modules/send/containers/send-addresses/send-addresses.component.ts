import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { environment } from '@environment';
import { DataService, WindowService, WebsocketService } from './../../../../services';
import { Store, select } from '@ngrx/store';
import {
  selectPasswordCheckSetting,
  selectWalletStatus,
  selectSendData
} from '../../../../store/selectors/wallet-state.selectors';
import { WasmService } from './../../../../wasm.service';
import { debounceTime } from 'rxjs/operators';
import { globalConsts, routes } from '@consts';
import Big from 'big.js';
import { selectAvailableUtxo } from '../../../../store/selectors/utxo.selectors';

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
    addressValidation: true,
    isAddressInputValid: false,
    amountValidated: false,
    feeIsCorrect: true,
    isNotEnoughAmount: false,
    notEnoughtValue: 0,
    popupOpened: false,
    isSendDataValid: false,
    isFullScreen: false,
  };

  private sub: Subscription;
  private changeSub: Subscription;

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
              private windowService: WindowService,
              private wsService: WebsocketService) {
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

    this.sub = dataService.changeEmitted$.subscribe(emittedState => {
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

    this.fullSendForm.get('amount').valueChanges.pipe(debounceTime(500)).subscribe(newValue => {
      this.amountChanged(newValue);
    });
    this.getSmallestUtxo();
  }

  getSmallestUtxo() {
    this.resetStats();
    this.walletStatus$.subscribe((status) => {
      this.utxos$.subscribe(utxos => {
        if (utxos.length > 0) {
          const sortedUtxo = utxos.sort((a, b) => {
            return a.amount - b.amount;
          });

          const smallestUtxoAmount = sortedUtxo[0].amount;
          this.stats.totalUtxo = new Big(smallestUtxoAmount).plus(100);
          const calculateSub = this.dataService.calculateTrChange(parseFloat(this.fullSendForm.value.fee));

          const subt = calculateSub.subscribe((msg: any) => {
            if (msg.id === 17) {
              subt.unsubscribe();

              const change = parseFloat(msg.result.change);
              this.stats.totalUtxo = new Big(smallestUtxoAmount).div(globalConsts.GROTHS_IN_BEAM);
              this.stats.amountToSend = new Big(0);
              this.stats.change = new Big(change).div(globalConsts.GROTHS_IN_BEAM);
              this.stats.remaining = 0;
            }
          });
        }
      }).unsubscribe();
    }).unsubscribe();
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  backConfirmationClicked() {
    this.router.navigate([routes.WALLET_MAIN_ROUTE]);
  }

  addAllClicked($event) {
    this.walletStatus$.subscribe((status) => {
      if (status.available > 0) {
        const allAmount = (status.available - this.fullSendForm.value.fee) / globalConsts.GROTHS_IN_BEAM;
        this.amountChanged(allAmount);
        this.addressInputCheck();
        this.localParams.isFullScreen ?
        this.fullSendForm.get('amount').setValue(allAmount) :
          this.sendForm.get('amount').setValue(allAmount);
      }
    }).unsubscribe();
  }

  outgoingClicked($event) {
    $event.stopPropagation();
  }

  feeChanged(control: FormControl) {
    const feeValue = control.value.replace(/[^0-9]/g, '');
    this.localParams.feeIsCorrect = parseInt(feeValue, 10) >= globalConsts.MIN_FEE_VALUE;
    control.setValue(feeValue);
    this.amountChanged(this.fullSendForm.value.amount);
    this.valuesValidationCheck();
  }

  amountChanged(amountInputValue) {
    this.resetStats();
    if (amountInputValue.length > 0 || amountInputValue > 0) {
      this.walletStatus$.subscribe((status) => {
        amountInputValue = new Big(amountInputValue);
        const feeFullValue = new Big(this.fullSendForm.value.fee).div(globalConsts.GROTHS_IN_BEAM);
        if (parseFloat(amountInputValue) > 0 && status.available > 0) {
          const available = new Big(status.available).div(globalConsts.GROTHS_IN_BEAM);

          if (parseFloat(amountInputValue.plus(feeFullValue)) > parseFloat(available)) {
            this.localParams.isNotEnoughAmount = true;
            this.localParams.notEnoughtValue = parseFloat(amountInputValue.plus(feeFullValue));
          } else {
            this.localParams.isNotEnoughAmount = false;
          }

          const calculateSub = this.dataService.calculateTrChange(parseFloat(amountInputValue.times(globalConsts.GROTHS_IN_BEAM)
            .plus(this.fullSendForm.value.fee)));

          const subt = calculateSub.subscribe((msg: any) => {
            if (msg.id === 17) {
              subt.unsubscribe();

              const change = parseFloat(msg.result.change);
              this.stats.amountToSend = new Big(parseFloat(amountInputValue));
              if (change > 0) {
                this.stats.change = new Big(change).div(globalConsts.GROTHS_IN_BEAM);
                this.stats.totalUtxo = this.stats.amountToSend.plus(feeFullValue).plus(this.stats.change);
                if (parseFloat(amountInputValue.plus(feeFullValue)) > parseFloat(available)) {
                  this.stats.remaining = new Big(0);
                  this.stats.change = new Big(0);
                  this.localParams.amountValidated = false;
                } else {
                  this.stats.remaining = available.minus(this.stats.amountToSend).minus(this.stats.change);
                  this.localParams.amountValidated = true;
                }
              } else {
                this.stats.totalUtxo = this.stats.amountToSend.plus(feeFullValue);
              }
              this.valuesValidationCheck();
            }
          });
        } else {
          this.resetStats();
          this.localParams.isNotEnoughAmount = true;
          this.stats.amountToSend = new Big(parseFloat(amountInputValue));
          this.stats.totalUtxo = new Big(this.stats.amountToSend.plus(feeFullValue));
          this.localParams.notEnoughtValue = parseFloat(amountInputValue.plus(feeFullValue));
          this.localParams.amountValidated = false;
        }
      }).unsubscribe();
    } else {
      this.localParams.isNotEnoughAmount = false;
      this.localParams.amountValidated = false;
      this.getSmallestUtxo();
    }
    this.valuesValidationCheck();
  }

  resetStats() {
    this.stats.totalUtxo = new Big(0);
    this.stats.amountToSend = new Big(0);
    this.stats.change = new Big(0);
    this.stats.remaining = new Big(0);
  }

  addressInputUpdated(value) {
    const tokenJson = this.wasmService.convertTokenToJson(value);
    if (value.length > 0 && tokenJson.length > 0) {
      const tokenData = JSON.parse(tokenJson);
      if (tokenData.params !== undefined &&
          tokenData.params.PeerWalletIdentity !== undefined &&
          tokenData.params.PeerID !== undefined) {
        if (tokenData.params.Amount !== undefined) {
          const amountFromToken = new Big(tokenData.params.Amount).div(globalConsts.GROTHS_IN_BEAM);
          this.fullSendForm.get('amount').setValue(amountFromToken.toFixed());
          this.amountChanged(amountFromToken.toFixed());
        }
        this.localParams.addressValidation = true;
      } else {
        this.localParams.addressValidation = false;
      }
    } else if (value.length > 0 && tokenJson.length === 0) {
      this.localParams.addressValidation = false;
    } else {
      this.localParams.addressValidation = true;
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
