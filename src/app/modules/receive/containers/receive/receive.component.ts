import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from '@environment';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import { DataService, WindowService, WebsocketService } from './../../../../services';
import { Store, select } from '@ngrx/store';
import { saveReceiveData } from './../../../../store/actions/wallet.actions';


import { selectAddress } from './../../../../store/selectors/address.selectors';
import { WasmService } from './../../../../wasm.service';
import { GlobalConsts } from '@consts';

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
  receiveForm: FormGroup;
  popupOpened = false;
  isFullScreen = false;
  qrCode = '';

  constructor(private store: Store<any>,
              public router: Router,
              private wasmService: WasmService,
              private dataService: DataService,
              private windowService: WindowService,
              private wsService: WebsocketService) {
    this.isFullScreen = windowService.isFullSize();
    this.receiveForm = new FormGroup({
      amount: new FormControl(),
      comment: new FormControl()
    });

    dataService.changeEmitted$.subscribe(emittedState => {
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
  }

  backClicked(event) {
    event.stopPropagation();
    this.router.navigate(['/wallet/main']);
  }

  createAddress() {
    this.sub = this.wsService.on().subscribe((msg: any) => {
      if (msg.result !== undefined && msg.id === 10) {
        this.dataService.addressesUpdate();
        const address$ = this.store.pipe(select(selectAddress(msg.result)));
        address$.subscribe(val => {
          if (val !== undefined) {
            this.generatedAddress = val.address;
            this.generatedToken = this.wasmService.getSendToken(this.generatedAddress, val.identity, 0);
            this.updateQr();
          }
        });
        console.log('[create_address:]');
        console.dir(msg);
        this.sub.unsubscribe();
      }
    });
    this.wsService.send({
        jsonrpc: '2.0',
        id: 10,
        method: 'create_address',
        params:
        {
            expiration : '24h',
            comment : ''
        }
    });
  }

  stripText(control: FormControl) {
    // control.setValue(control.value.replace(/[^0-9]/g, ''));
    const amount = parseInt(control.value, 10) * GlobalConsts.GROTHS_IN_BEAM;
    this.generatedToken = this.wasmService.getSendToken(this.generatedAddress, this.identity, amount);
    this.updateQr();
  }

  updateComment(control: FormControl) {
    control.setValue(control.value);
    this.updateQr();
  }

  editAddress() {
    this.sub = this.wsService.on().subscribe((msg: any) => {
      if (msg.result) {
        console.log(msg.result);
        this.sub.unsubscribe();
      }
    });
    this.wsService.send({
        jsonrpc: '2.0',
        id: 123,
        method: 'edit_address',
        params:
        {
            address : '19ecec1a5793060fd9e49ee67560da4a4cf7ad8a42577019a9fa0f95fe6e550e81e',
            comment : '',
            expiration: 'never'
        }
    });
  }

  qrShowClicked(event) {
    event.stopPropagation();
    this.router.navigate([this.router.url, { outlets: { popup: 'qr-popup' }}]);
    this.submit();
  }

  updateQr() {
    this.qrCode = 'beam:' + this.generatedToken + (this.receiveForm.value.amount ?
      ('?amount=' + this.receiveForm.value.amount) : '') +
      (this.receiveForm.value.comment && this.receiveForm.value.comment.length > 0 ?
      ('?comment=' + this.receiveForm.value.comment) : '');
  }

  submit() {
    this.store.dispatch(saveReceiveData({receive: {
      address: this.generatedAddress,
      amount: this.receiveForm.value.amount,
      comment: this.receiveForm.value.comment
    }}));
  }
}
