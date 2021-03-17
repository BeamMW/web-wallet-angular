import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from '@environment';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';
import { DataService, WindowService, WasmService } from '@app/services';
import { Store, select } from '@ngrx/store';
import { saveReceiveData } from '@app/store/actions/wallet.actions';
import { selectAddress } from '@app/store/selectors/address.selectors';
import { globalConsts, rpcMethodIdsConsts } from '@consts';

@Component({
  selector: 'app-receive',
  templateUrl: './receive.component.html',
  styleUrls: ['./receive.component.scss']
})
export class ReceiveComponent implements OnInit, OnDestroy {
  public iconBack = `${environment.assetsPath}/images/modules/send/containers/send-addresses/icon-back.svg`;
  public generatedAddress = '';
  public generatedToken = '';
  public identity = '';

  private sub: Subscription;
  private serviceSub: Subscription;
  private popupSub: Subscription;
  private addrSub: Subscription;

  receiveForm: FormGroup;
  popupOpened = false;
  isFullScreen = false;
  qrCode = '';

  constructor(private store: Store<any>,
              public router: Router,
              private wasmService: WasmService,
              private dataService: DataService,
              private windowService: WindowService) {
    this.isFullScreen = windowService.isFullSize();
    this.receiveForm = new FormGroup({
      amount: new FormControl(),
      comment: new FormControl()
    });

    this.popupSub = dataService.changeEmitted$.subscribe(emittedState => {
      this.popupOpened = emittedState;
    });
  }

  ngOnInit() {
    this.createAddress();
  }

  ngOnDestroy() {
    if (this.sub !== undefined) {
      this.sub.unsubscribe();
    }

    if (this.popupSub !== undefined) {
      this.popupSub.unsubscribe();
    }

    if (this.serviceSub !== undefined) {
      this.serviceSub.unsubscribe();
    }

    if (this.addrSub !== undefined) {
      this.addrSub.unsubscribe();
    }
  }

  backClicked(event) {
    event.stopPropagation();
    this.router.navigate(['/wallet/main']);
  }

  createAddress() {
    var i = this.wasmService.wallet.subscribe((r)=> {
      const respone = JSON.parse(r);
      if (respone.id === rpcMethodIdsConsts.CREATE_ADDRESS_ID) {
        //this.serviceSub.unsubscribe();
        this.dataService.addressesUpdate();
        this.dataService.startInterval();
        const address$ = this.store.pipe(select(selectAddress(respone.result)));
        this.addrSub = address$.subscribe(val => {
          if (val !== undefined) {
            this.generatedAddress = val.address;
            //this.identity = val.identity;
            this.generatedToken = val.address;//this.wasmService.getSendToken(this.generatedAddress, val.identity, '');
            //this.updateQr();
            this.addrSub.unsubscribe();
          }
        });
      }
    });

    this.dataService.stopInterval();
    this.wasmService.wallet.sendRequest(JSON.stringify({
      jsonrpc: '2.0',
      id: rpcMethodIdsConsts.CREATE_ADDRESS_ID,
      method: 'create_address',
      params:
      {
          expiration : '24h',
          comment : ''
      }
    }));
  }

  amountUpdated(control: FormControl) {
    const amount = control.value.length > 0 ?
      (parseFloat(control.value) * globalConsts.GROTHS_IN_BEAM).toString() : '';
    this.generatedToken = this.generatedAddress;//this.wasmService.getSendToken(this.generatedAddress, this.identity, amount);
    this.updateQr();
  }

  updateComment(control: FormControl) {
    control.setValue(control.value);
    this.updateQr();
  }

  // editAddress() {
  //   this.sub = this.wsService.on().subscribe((msg: any) => {
  //     if (msg.result) {
  //       console.log(msg.result);
  //       this.sub.unsubscribe();
  //     }
  //   });
  //   this.wsService.send({
  //       jsonrpc: '2.0',
  //       id: 123,
  //       method: 'edit_address',
  //       params:
  //       {
  //           address : '19ecec1a5793060fd9e49ee67560da4a4cf7ad8a42577019a9fa0f95fe6e550e81e',
  //           comment : '',
  //           expiration: 'never'
  //       }
  //   });
  // }

  // qrShowClicked(event) {
  //   event.stopPropagation();
  //   this.router.navigate([this.router.url, { outlets: { popup: 'qr-popup' }}]);
  //   this.submit();
  // }

  updateQr() {
    this.qrCode = 'beam:' + this.generatedToken + (this.receiveForm.value.amount ?
      ('?amount=' + this.receiveForm.value.amount) : '') +
      (this.receiveForm.value.comment && this.receiveForm.value.comment.length > 0 ?
      ('?comment=' + this.receiveForm.value.comment) : '');
  }

  submit() {
    this.store.dispatch(saveReceiveData({receive: {
      address: this.generatedToken,
      amount: this.receiveForm.value.amount,
      comment: this.receiveForm.value.comment
    }}));
  }
}
