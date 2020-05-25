import { Component, OnInit, OnDestroy } from '@angular/core';
import {Router} from '@angular/router';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { environment } from '@environment';
import { DataService, WindowService, WebsocketService } from './../../../../services';
import { Store, select } from '@ngrx/store';
import { selectWalletStatus } from '../../../../store/selectors/wallet-state.selectors';
import { saveSendData } from './../../../../store/actions/wallet.actions';

const MIN_FEE_VALUE = 100;
const GROTHS_IN_BEAM = 100000000;

@Component({
  selector: 'app-send-addresses',
  templateUrl: './send-addresses.component.html',
  styleUrls: ['./send-addresses.component.scss']
})
export class SendAddressesComponent implements OnInit, OnDestroy {
  public iconBack: string = `${environment.assetsPath}/images/modules/send/containers/send-addresses/icon-back.svg`;
  public arrowIcon: string = `${environment.assetsPath}/images/modules/send/containers/send-addresses/arrow.svg`;
  send = {
    address: ''
  };
  sendForm: FormGroup;
  fullSendForm: FormGroup;
  walletStatus$: Observable<any>;
  sendFrom: string;

  localParams = {
    addressValidated: false,
    addressValidation: true,
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
              private store: Store<any>,
              private windowService: WindowService,
              private wsService: WebsocketService) {
    this.walletStatus$ = this.store.pipe(select(selectWalletStatus));
    this.localParams.isFullScreen = windowService.isFullSize();
    this.send = this.dataService.sendStore.getState().send;
    let address = '';
    if (this.send !== undefined && this.send.address !== undefined) {
      address = this.send.address;
    }

    this.sendForm = new FormGroup({
      address: new FormControl(address,  [
        Validators.required
      ])
    });

    this.fullSendForm = new FormGroup({
      address: new FormControl('',  [
        Validators.required
      ]),
      fee: new FormControl(MIN_FEE_VALUE, [
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
    this.dataService.sendStore.putState({send: {
      address: this.sendForm.value.address
    }});
    this.router.navigate(['/send/amount']);
  }

  fullSubmit($event) {
    $event.stopPropagation();
    if (this.localParams.feeIsCorrect &&
          this.localParams.isSendDataValid) {
      this.store.dispatch(saveSendData({
        send: {
          address: this.fullSendForm.value.address,
          fee: this.fullSendForm.value.fee,
          amount: this.fullSendForm.value.amount * GROTHS_IN_BEAM,
          comment: this.fullSendForm.value.comment,
          from: this.sendFrom
        }
      }));

      this.router.navigate([this.router.url, { outlets: { popup: 'confirm-popup' }}]);
    }
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  backConfirmationClicked() {
    this.router.navigate(['/wallet/main']);
  }

  addAllClicked($event) {
    $event.preventDefault();
    this.walletStatus$.subscribe((status) => {
      if (status.available > 0) {
        const allAmount = (status.available - this.fullSendForm.value.fee) / GROTHS_IN_BEAM;
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

  stripFee(control: FormControl) {
    const feeValue = control.value.replace(/[^0-9]/g, '');
    this.localParams.feeIsCorrect = parseInt(feeValue, 10) >= MIN_FEE_VALUE;
    control.setValue(feeValue);
  }

  amountChanged(amountInputValue) {
    this.walletStatus$.subscribe((status) => {
      const feeFullValue = this.fullSendForm.value.fee / GROTHS_IN_BEAM;
      const available = status.available / GROTHS_IN_BEAM;
      amountInputValue = parseFloat(amountInputValue);

      if ((amountInputValue + feeFullValue) > available) {
        this.localParams.isNotEnoughAmount = true;
        this.localParams.notEnoughtValue = amountInputValue + feeFullValue;
      } else {
        this.localParams.isNotEnoughAmount = false;
      }

      if (status.available > 0) {
        const utxoVal = Math.ceil(amountInputValue);
        this.stats.totalUtxo = utxoVal === amountInputValue ? utxoVal + 1 : utxoVal;
        this.stats.amountToSend = amountInputValue.length > 0 ? amountInputValue : 0;
        if (amountInputValue > available) {
          this.stats.change = 0;
          this.stats.remaining = 0;
        } else {
          this.stats.change = this.stats.totalUtxo > amountInputValue ?
            (this.stats.totalUtxo - amountInputValue - feeFullValue) :
            (this.stats.totalUtxo + 1 - feeFullValue);
          this.stats.remaining = available - amountInputValue - feeFullValue;
        }
      }
    }).unsubscribe();

    this.localParams.amountValidated = amountInputValue > 0;
    this.valuesValidationCheck();
  }

  addressInputUpdated(value) {
    this.localParams.addressValidated = value.length > 0;
    this.valuesValidationCheck();
    // TODO: ENABLE WHEN TOKEN VALIDATE WILL BE ADDED
    // if (value === null || value.length === 0) {
    //   this.addressValidation = true;
    // } else {
    //   this.validateAddress(value);
    // }
  }

  valuesValidationCheck() {
    this.localParams.isSendDataValid = this.localParams.amountValidated && 
      this.localParams.addressValidated &&
      !this.localParams.isNotEnoughAmount;
  }

  // validateAddress(addressValue: string) {
  //   this.sub = this.wsService.on().subscribe((msg: any) => {
  //     if (msg.result !== undefined && msg.id === 1 && msg.result.is_valid !== undefined) {
  //       this.localParams.addressValidated = msg.result.is_valid;
  //       this.localParams.addressValidation = msg.result.is_valid;
  //       this.valuesValidationCheck();
  //       this.sub.unsubscribe();
  //     }
  //   });
  //   this.wsService.send({
  //       jsonrpc: '2.0',
  //       id: 1,
  //       method: 'validate_address',
  //       params:
  //       {
  //           address : addressValue
  //       }
  //   });
  // }
}
