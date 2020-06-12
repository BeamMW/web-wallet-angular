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

  stats = {
    totalUtxo: 0,
    amountToSend: 0,
    change: 0,
    remaining: 0
  };

  constructor(private dataService: DataService,
              public router: Router,
              private wasmService: WasmService,
              private store: Store<any>,
              private windowService: WindowService,
              private wsService: WebsocketService) {
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
          amount: this.fullSendForm.value.amount * globalConsts.GROTHS_IN_BEAM,
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

    //this.searchCtrlSub =
    // this.fullSendForm.get('amount').valueChanges.pipe(debounceTime(500)).subscribe(newValue => {
    //   this.amountChanged(newValue);
    // });
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
    $event.preventDefault();
    this.walletStatus$.subscribe((status) => {
      if (status.available > 0) {
        const allAmount = (status.available - this.fullSendForm.value.fee) / globalConsts.GROTHS_IN_BEAM;
        this.amountChanged(allAmount);
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
    this.valuesValidationCheck();
  }

  amountChanged(amountInputValue) {
    this.walletStatus$.subscribe((status) => {
      const feeFullValue = this.fullSendForm.value.fee / globalConsts.GROTHS_IN_BEAM;
      const available = status.available / globalConsts.GROTHS_IN_BEAM;
      amountInputValue = parseFloat(amountInputValue);

      if ((amountInputValue + feeFullValue) > available) {
        this.localParams.isNotEnoughAmount = true;
        this.localParams.notEnoughtValue = amountInputValue + feeFullValue;
      } else {
        this.localParams.isNotEnoughAmount = false;
      }

      if (amountInputValue > 0 && status.available > 0) {
        this.dataService.calculateTrChange(amountInputValue * globalConsts.GROTHS_IN_BEAM + this.fullSendForm.value.fee);
        this.sendData$ = this.store.pipe(select(selectSendData));
        this.sendData$.subscribe(sendData => {
          if (sendData.change > 0) {
            this.stats.change = sendData.change / globalConsts.GROTHS_IN_BEAM;
            this.stats.amountToSend = amountInputValue > 0 ? amountInputValue : 0;
            this.stats.totalUtxo = this.stats.amountToSend + (this.stats.change + feeFullValue);
            if ((amountInputValue + feeFullValue) > available) {
              this.stats.remaining = 0;
            } else {
              this.stats.remaining = available - this.stats.totalUtxo;
            }
          }
        });
      } else {
        this.stats.totalUtxo = 0;
        this.stats.amountToSend = 0;
        this.stats.change = 0;
        this.stats.remaining = 0;
      }
    }).unsubscribe();

    this.localParams.amountValidated = amountInputValue > 0;
    this.valuesValidationCheck();
  }

  // amountChanged(amountInputValue) {
  //   this.walletStatus$.subscribe((status) => {
  //     if (amountInputValue > 0 && status.available > 0) {
  //       const feeFullValue = new Big(this.fullSendForm.value.fee).div(globalConsts.GROTHS_IN_BEAM);
  //       const available = new Big(status.available).div(globalConsts.GROTHS_IN_BEAM);
  //       amountInputValue = new Big(amountInputValue);

  //       if (parseFloat(amountInputValue.plus(feeFullValue)) > parseFloat(available)) {
  //         this.localParams.isNotEnoughAmount = true;
  //         this.localParams.notEnoughtValue = parseFloat(amountInputValue.plus(feeFullValue));
  //       } else {
  //         this.localParams.isNotEnoughAmount = false;
  //       }

  //       this.dataService.calculateTrChange(parseFloat(amountInputValue.times(globalConsts.GROTHS_IN_BEAM)
  //         .plus(this.fullSendForm.value.fee)));
  //       this.sendData$ = this.store.pipe(select(selectSendData));
  //       const sub = this.sendData$.subscribe(sendData => {
  //         if (parseFloat(sendData.change) > 0) {
  //           sub.unsubscribe();
  //           this.stats.change = parseFloat(new Big(sendData.change).div(globalConsts.GROTHS_IN_BEAM));
  //           this.stats.amountToSend = parseFloat(new Big(parseFloat(amountInputValue) > 0 ? parseFloat(amountInputValue) : 0));
  //           this.stats.totalUtxo = parseFloat(new Big(this.stats.amountToSend).plus(this.stats.change).plus(feeFullValue));
  //           if (parseFloat(amountInputValue.plus(feeFullValue)) > parseFloat(available)) {
  //             this.stats.remaining = 0;
  //           } else {
  //             this.stats.remaining = parseFloat(available.minus(this.stats.totalUtxo));
  //           }
  //         }
  //       });
  //     } else {
  //       this.stats.totalUtxo = 0;
  //       this.stats.amountToSend = 0;
  //       this.stats.change = 0;
  //       this.stats.remaining = 0;
  //     }
  //   }).unsubscribe();

  addressInputUpdated(value) {
    const tokenJson = this.wasmService.convertTokenToJson(value);
    if (value.length > 0 && tokenJson.length > 0) {
      const tokenData = JSON.parse(tokenJson);
      if (tokenData.params !== undefined &&
          tokenData.params.PeerWalletIdentity !== undefined &&
          tokenData.params.PeerID !== undefined) {
        if (tokenData.params.Amount !== undefined) {
          const amountFromToken = tokenData.params.Amount / globalConsts.GROTHS_IN_BEAM;
          this.fullSendForm.get('amount').setValue(amountFromToken);
          this.amountChanged(amountFromToken);
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

    this.valuesValidationCheck();
    this.addressInputCheck();
  }

  addressInputCheck() {
    this.localParams.isAddressInputValid = this.sendForm.value.address.length > 0 &&
      this.localParams.addressValidation;
  }

  valuesValidationCheck() {
    this.localParams.isSendDataValid = this.localParams.amountValidated &&
      this.localParams.feeIsCorrect &&
      this.localParams.addressValidation &&
      !this.localParams.isNotEnoughAmount;
  }
}
