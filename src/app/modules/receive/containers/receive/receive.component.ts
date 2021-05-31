import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from '@environment';
import { Router } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';
import { DataService, WindowService, WasmService } from '@app/services';
import { Store, select } from '@ngrx/store';
import { saveReceiveData } from '@app/store/actions/wallet.actions';
import { globalConsts, transactionTypes, rpcMethodIdsConsts, routes } from '@consts';
import { ClipboardService } from 'ngx-clipboard'
import {
  selectAssetsInfo
} from '@app/store/selectors/wallet-state.selectors';

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

  private subscriptions: Subscription[] = [];
  private assetsData$: Observable<any>;
  
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
    amount: 0,
    isAssetDropdownVisible: false,
  }

  public assets = [];
  public selectedAssetValue = {
    asset_id: 0
  };

  private DEFAULT_ASSET = {
    asset_id: 0,
    metadata: {
      unit_name: 'BEAM'
    }
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

    this.subscriptions.push(dataService.changeEmitted$.subscribe(emittedState => {
      this.componentParams.popupOpened = emittedState;
    }));

    this.assets.push(this.DEFAULT_ASSET);
    this.selectedAssetValue = this.DEFAULT_ASSET;

    this.assetsData$ = this.store.pipe(select(selectAssetsInfo));
    this.subscriptions.push(this.assetsData$.subscribe(value => {
      this.assets = [];
      this.assets.push(this.DEFAULT_ASSET)
      this.assets.push(...value);
    }));
  }

  ngOnInit() {
    this.createAddress();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
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

    this.dataService.createAddress('regular_new', 'auto', 
      this.receiveForm.value.comment ? this.receiveForm.value.comment : '');
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

  public currencySelectorClicked($event: Event) {
    $event.stopPropagation();
    this.componentParams.isAssetDropdownVisible = !this.componentParams.isAssetDropdownVisible;
  }

  public onClickedOutside(element) {
    this.componentParams.isAssetDropdownVisible = false;
  }

  public selectAssetItemClicked(value) {
    this.selectedAssetValue = value;
    this.componentParams.isAssetDropdownVisible = false;
  }
}
