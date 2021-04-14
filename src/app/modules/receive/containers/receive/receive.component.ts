import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from '@environment';
import { Router } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';
import { DataService, WindowService, WasmService } from '@app/services';
import { Store, select } from '@ngrx/store';
import { saveReceiveData } from '@app/store/actions/wallet.actions';
import { selectAddress } from '@app/store/selectors/address.selectors';
import { globalConsts, transactionTypes, rpcMethodIdsConsts, routes } from '@consts';
import { ClipboardService } from 'ngx-clipboard'

@Component({
  selector: 'app-receive',
  templateUrl: './receive.component.html',
  styleUrls: ['./receive.component.scss']
})
export class ReceiveComponent implements OnInit, OnDestroy {
  private sub: Subscription;
  private serviceSub: Subscription;
  private popupSub: Subscription;
  private addrSub: Subscription;

  public receiveForm: FormGroup;
  public transactionTypes = transactionTypes;
  public ratesData: any;

  public componentParams = {
    iconBack: `${environment.assetsPath}/images/modules/send/containers/send-addresses/icon-back.svg`,
    iconBeam: `${environment.assetsPath}/images/modules/receive/containers/receive/icon-beam.svg`,
    iconArrowDown: `${environment.assetsPath}/images/modules/receive/containers/receive/icon-arrow-down.svg`,
    iconArrowUp: `${environment.assetsPath}/images/modules/receive/containers/receive/icon-arrow-up.svg`,
    iconCopy: `${environment.assetsPath}/images/modules/receive/containers/receive/icon-copy-blue-new.svg`,
    generatedAddress: '',
    backLink: routes.WALLET_MAIN_ROUTE,
    titleText: 'Wallet',
    subtitleText: 'RECEIVE',
    switcherValues: {
      regular: transactionTypes.regular,
      maxPrivacy: transactionTypes.maxPrivacy
    },
    switcherSelectedValue: '',
    isFullScreen: false,
    popupOpened: false,
    qrCode: '',
    amountExpanded: true,
    commentExpanded: false,
    amount: 0
  }

  constructor(private store: Store<any>,
              public router: Router,
              private wasmService: WasmService,
              private dataService: DataService,
              private _clipboardService: ClipboardService,
              private windowService: WindowService) {
    this.componentParams.isFullScreen = windowService.isFullSize();
    this.componentParams.switcherSelectedValue = transactionTypes.regular;
    this.receiveForm = new FormGroup({
      amount: new FormControl(),
      comment: new FormControl()
    });

    this.popupSub = dataService.changeEmitted$.subscribe(emittedState => {
      this.componentParams.popupOpened = emittedState;
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

  public backClicked(event) {
    event.stopPropagation();
    this._clipboardService.copy(this.componentParams.generatedAddress);
    this.router.navigate(['/wallet/main']);
  }

  public copyClicked() {
    this._clipboardService.copy(this.componentParams.generatedAddress);
  }

  public createAddress() {
    var i = this.wasmService.wallet.subscribe((r)=> {
      const respone = JSON.parse(r);
      
      if (respone.id === rpcMethodIdsConsts.CREATE_ADDRESS_ID) {
        //this.serviceSub.unsubscribe();
        //this.dataService.addressesUpdate();
        //this.dataService.startInterval();
        this.componentParams.generatedAddress = respone.result;
        this.updateQr();
        // const address$ = this.store.pipe(select(selectAddress(respone.result)));
        // this.addrSub = address$.subscribe(val => {
        //   if (val !== undefined) {
            
        //     this.updateQr();
        //     this.addrSub.unsubscribe();
        //   }
        // });
      }
    });

    //this.dataService.stopInterval();
    this.wasmService.wallet.sendRequest(JSON.stringify({
      jsonrpc: '2.0',
      id: rpcMethodIdsConsts.CREATE_ADDRESS_ID,
      method: 'create_address',
      params:
      {
          type: this.componentParams.switcherSelectedValue,
          expiration : 'auto',
          comment : '',
          new_style_regular : this.componentParams.switcherSelectedValue === transactionTypes.regular
      }
    }));
  }

  amountUpdated(control: FormControl) {
    this.componentParams.amount = control.value ? control.value : 0;
    this.updateQr();
  }

  updateComment(control: FormControl) {
    control.setValue(control.value);
    this.updateQr();
  }

  // qrShowClicked(event) {
  //   event.stopPropagation();
  //   this.router.navigate([this.router.url, { outlets: { popup: 'qr-popup' }}]);
  //   this.submit();
  // }

  updateQr() {
    this.componentParams.qrCode = 'beam:' + this.componentParams.generatedAddress + 
      (this.receiveForm.value.amount ? ('?amount=' + this.receiveForm.value.amount) : '') +
      (this.receiveForm.value.comment && this.receiveForm.value.comment.length > 0 ?
      ('?comment=' + this.receiveForm.value.comment) : '');
  }

  submit() {
    this.store.dispatch(saveReceiveData({receive: {
      address: this.componentParams.generatedAddress,
      amount: this.receiveForm.value.amount,
      comment: this.receiveForm.value.comment
    }}));
  }

  public switcherClicked(event, value:string) {
    this.componentParams.switcherSelectedValue = value;
    this.createAddress();
  }

  public amountControlClicked() {
    this.componentParams.amountExpanded = !this.componentParams.amountExpanded; 
  }

  public commentControlClicked() {
    this.componentParams.commentExpanded = !this.componentParams.commentExpanded;
  }

  public truncStringPortion(str, firstCharCount = str.length, endCharCount = 0, dotCount = 3) {
    var convertedStr="";
    convertedStr+=str.substring(0, firstCharCount);
    convertedStr += ".".repeat(dotCount);
    convertedStr+=str.substring(str.length-endCharCount, str.length);
    return convertedStr;
  }

  public addressDetailsClicked() {

  }
}
