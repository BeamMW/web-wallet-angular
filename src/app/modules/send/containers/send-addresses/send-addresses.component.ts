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
  isFullScreen = false;
  walletStatus$: Observable<any>;
  walletStatusSub: Subscription;
  popupOpened = false;
  sendFrom: string;
  isSendDataValid = false;
  addressValidated = false;
  addressValidation = true;
  amountValidated = false;

  feeIsCorrect = true;
  isOutgoingFull = true;
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
    this.isFullScreen = windowService.isFullSize();
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

    dataService.changeEmitted$.subscribe(emittedState => {
      this.popupOpened = emittedState;
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
    if (this.feeIsCorrect && this.isSendDataValid) {
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
    if (this.walletStatusSub) {
      this.walletStatusSub.unsubscribe();
    }

    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  backConfirmationClicked() {
    this.router.navigate(['/wallet/main']);
  }

  addAll($event) {
    $event.preventDefault();
    this.walletStatusSub = this.walletStatus$.subscribe((status) => {
      if (status.available > 0) {
        this.isFullScreen ?
          this.fullSendForm.get('amount').setValue((status.available - this.fullSendForm.value.fee) / GROTHS_IN_BEAM) :
          this.sendForm.get('amount').setValue((status.available - this.sendForm.value.fee) / GROTHS_IN_BEAM);
      }
    });
  }

  outgoingClicked($event) {
    $event.stopPropagation();
    this.isOutgoingFull = !this.isOutgoingFull;
  }

  stripFee(control: FormControl) {
    const feeValue = control.value.replace(/[^0-9]/g, '');
    this.feeIsCorrect = parseInt(feeValue, 10) >= MIN_FEE_VALUE;
    control.setValue(feeValue);
  }

  amountChanged(value) {
    this.walletStatusSub = this.walletStatus$.subscribe((status) => {
      const feeFullValue = this.fullSendForm.value.fee / GROTHS_IN_BEAM;
      const available = status.available / GROTHS_IN_BEAM;
      if (status.available > 0) {
        const utxoVal = Math.ceil(value);
        this.stats.totalUtxo = utxoVal === parseInt(value, 10) ? utxoVal + 1 : utxoVal;
        this.stats.amountToSend = value;
        if (value > available) {
          this.stats.change = 0;
          this.stats.remaining = 0;
        } else {
          this.stats.change = this.stats.totalUtxo > value ?
            (this.stats.totalUtxo - value - feeFullValue) :
            (this.stats.totalUtxo + 1 - feeFullValue);
          this.stats.remaining = available - value - feeFullValue;
        }
      }
    });

    this.amountValidated = value.length > 0;
    this.valuesValidationCheck();
  }

  addressInputUpdated(value) {
    this.addressValidated = value.length > 0;
    // TODO: ENABLE WHEN TOKEN VALIDATE WILL BE ADDED
    // if (value === null || value.length === 0) {
    //   this.addressValidation = true;
    // } else {
    //   this.validateAddress(value);
    // }
  }

  valuesValidationCheck() {
    this.isSendDataValid = this.amountValidated && this.addressValidated;
  }

  validateAddress(addressValue: string) {
    this.sub = this.wsService.on().subscribe((msg: any) => {
      if (msg.result !== undefined && msg.id === 1 && msg.result.is_valid !== undefined) {
        this.addressValidated = msg.result.is_valid;
        this.addressValidation = msg.result.is_valid;
        this.valuesValidationCheck();
        this.sub.unsubscribe();
      }
    });
    this.wsService.send({
        jsonrpc: '2.0',
        id: 1,
        method: 'validate_address',
        params:
        {
            address : addressValue
        }
    });
  }
}
