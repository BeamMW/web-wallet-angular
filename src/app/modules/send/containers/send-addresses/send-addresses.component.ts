import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
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
  selectAddressValidationData,
  selectCalculatedChange,
  selectAssetsInfo
} from '@app/store/selectors/wallet-state.selectors';
import { debounceTime } from 'rxjs/operators';
import { 
  globalConsts,
  rpcMethodIdsConsts,
  transactionTypes,
  routes 
} from '@consts';
import Big from 'big.js';

@Component({
  selector: 'app-send-addresses',
  templateUrl: './send-addresses.component.html',
  styleUrls: ['./send-addresses.component.scss']
})
export class SendAddressesComponent implements OnInit, OnDestroy {
  
  @ViewChild('selected', {static: true}) selected: ElementRef;
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
      name: 'Regular address'
    },
    'unknown': {
      name: ''
    }
  };

  private DEFAULT_ASSET = {
    asset_id: 0,
    metadata: {
      unit_name: 'BEAM'
    }
  }

  public sendForm: FormGroup;
  public fullSendForm: FormGroup;

  public walletStatus$: Observable<any>;
  public addressValidation$: Observable<any>;
  private calculatedChange$: Observable<any>;
  private passwordCheckSetting$: Observable<any>;
  private assetsData$: Observable<any>;

  private isPassCheckEnabled = false;
  public transactionTypes = transactionTypes;

  public componentParams = {
    iconBack: `${environment.assetsPath}/images/modules/send/containers/send-addresses/icon-back.svg`,
    iconBeam: `${environment.assetsPath}/images/modules/receive/containers/receive/icon-beam.svg`,
    iconArrowDown: `${environment.assetsPath}/images/modules/receive/containers/receive/icon-arrow-down.svg`,
    iconArrowUp: `${environment.assetsPath}/images/modules/receive/containers/receive/icon-arrow-up.svg`,
    iconButtonArrowUp: `${environment.assetsPath}/images/modules/send/containers/send-addresses/icon-send-blue.svg`,
    prevFee: 0,
    addressValidation: true,
    isAddressInputValid: false,
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
    switcherValues: {
      regular: transactionTypes.regular,
      offline: transactionTypes.offline
    },
    switcherSelectedValue: '',
    validationResult: '',
    isTypeVisible: false,
    isAssetDropdownVisible: false
  };

  public assets = [];
  public selectedAssetValue = {
    asset_id: 0
  };

  private status = {
    available: 0
  };
  private globalStatus = {
    totals: []
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
    asset_change: new Big(0),
    remaining: new Big(0),
    fee: new Big(0),
    beam_remaining: new Big(0)
  };

  constructor(private dataService: DataService,
              public router: Router,
              private store: Store<any>,
              private windowService: WindowService) {
    this.assets.push(this.DEFAULT_ASSET);
    this.selectedAssetValue = this.DEFAULT_ASSET;
    this.walletStatus$ = this.store.pipe(select(selectWalletStatus));
    this.componentParams.isFullScreen = windowService.isFullSize();
    this.componentParams.switcherSelectedValue = transactionTypes.regular;
    this.passwordCheckSetting$ = this.store.pipe(select(selectPasswordCheckSetting));
    this.passwordCheckSetting$.subscribe(settingValue => {
      this.isPassCheckEnabled = settingValue;
    }).unsubscribe();

    this.addressValidation$ = this.store.pipe(select(selectAddressValidationData));
    this.addressValidation$.subscribe(value => {
      if (value) {
        this.componentParams.validationResult = this.addressTypes[value.type].name;
        this.componentParams.isTypeVisible = this.componentParams.validationResult === this.addressTypes['offline'].name; 
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
      comment: new FormControl(''),
      amount: new FormControl('', [
        Validators.required
      ])
    });

    this.subManager.sub = dataService.changeEmitted$.subscribe(emittedState => {
      this.componentParams.popupOpened = emittedState;
    });
    this.calculatedChange$ = this.store.pipe(select(selectCalculatedChange));
    this.calculatedChange$.subscribe(changeValue => {
      if (changeValue.change) {
        const available = new Big(this.status.available).div(globalConsts.GROTHS_IN_BEAM);
        this.stats.change = new Big(changeValue.change).div(globalConsts.GROTHS_IN_BEAM);
        this.stats.asset_change = new Big(changeValue.asset_change).div(globalConsts.GROTHS_IN_BEAM);
        this.stats.remaining = available.minus(this.stats.amountToSend)
          .minus(this.selectedAssetValue.asset_id !== 0 ? this.stats.asset_change : this.stats.change);
  
        const bigAmount = new Big(this.stats.amountToSend);
        const feeFullValue = new Big(changeValue.fee).div(globalConsts.GROTHS_IN_BEAM);
        this.stats.fee = new Big(changeValue.fee).div(globalConsts.GROTHS_IN_BEAM);
        if (this.stats.amountToSend > 0) {
          if (this.status.available > 0) {
            if (parseFloat(bigAmount.plus(feeFullValue)) > parseFloat(available)) {
              this.componentParams.isEnoughAmount = false;
              this.componentParams.notEnoughtValue = bigAmount.plus(this.stats.fee);
              this.stats.remaining = new Big(0);
              this.stats.change = new Big(0);
            } else {
              this.componentParams.isEnoughAmount = true;
            }
          } else {
            this.resetStats();
            this.componentParams.isEnoughAmount = false;
            this.componentParams.notEnoughtValue = bigAmount.plus(feeFullValue);
          }
        } else {
          if (this.stats.fee > this.status.available) {
            this.resetStats();
            this.componentParams.isEnoughAmount = false;
            this.componentParams.notEnoughtValue = feeFullValue.minus(available);
            
          } else {
            this.componentParams.isEnoughAmount = true;
            //this.getSmallestUtxo();
          }
        }
        this.valuesValidationCheck();
      }
    });

    this.assetsData$ = this.store.pipe(select(selectAssetsInfo));
    this.assetsData$.subscribe(value => {
      this.assets = [];
      this.assets.push(this.DEFAULT_ASSET)
      this.assets.push(...value);
    });
  }

  submit() {
    if (this.componentParams.isSendDataValid) {
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

  public nextClicked($event: Event) {
    $event.stopPropagation();
    if (this.componentParams.isSendDataValid) {
      const navigationExtras: NavigationExtras = {
        state: {
          address: this.fullSendForm.value.address,
          fee: parseInt((this.stats.fee.times(globalConsts.GROTHS_IN_BEAM)).toFixed(), 10),
          comment: this.fullSendForm.value.comment,
          amount: parseInt((new Big(this.fullSendForm.value.amount).times(globalConsts.GROTHS_IN_BEAM)).toFixed(), 10),
          isPassCheckEnabled: this.isPassCheckEnabled,
          asset_id: this.selectedAssetValue.asset_id,
          offline: this.componentParams.switcherSelectedValue === transactionTypes.offline
        }
      };
      this.router.navigate([this.router.url, { outlets: { popup: 'confirm-popup' }}], navigationExtras);
    }
  }

  ngOnInit() {
    if (this.sendForm.value.address.length > 0) {
      this.addressInputUpdated(this.sendForm.value.address);
    }

    this.walletStatus$.subscribe((status) => {
      this.globalStatus = status;
      const asset = status.totals.find(value => value.asset_id === this.selectedAssetValue.asset_id);
      if (asset) {
        this.status = asset;
        this.stats.remaining = new Big(asset.available).div(globalConsts.GROTHS_IN_BEAM);
        this.stats.beam_remaining = new Big(status.totals[0].available).div(globalConsts.GROTHS_IN_BEAM);
      }
    });

    this.fullSendForm.get('amount').valueChanges.pipe(debounceTime(300)).subscribe(newValue => {
      this.amountChanged(newValue);
    });
  }

  ngOnDestroy() {
    this.subManager.sub.unsubscribe();
  }

  backConfirmationClicked() {
    this.router.navigate([routes.WALLET_MAIN_ROUTE]);
  }

  addAllClicked($event) {
    this.walletStatus$.subscribe((status) => {
      if (status.totals[0].available > 0 && status.totals[0].available > this.fullSendForm.value.fee) {
        const allAmount = (new Big(status.totals[0].available).minus(this.fullSendForm.value.fee))
          .div(globalConsts.GROTHS_IN_BEAM);
        this.amountChanged(allAmount.toFixed());
        this.addressInputCheck();
        this.fullSendForm.get('amount').setValue(allAmount.toFixed());
      }
    }).unsubscribe();
  }

  private amountChanged(amountInputValue) {
    this.resetStats();
    const amount = parseFloat(amountInputValue.length > 0 ? amountInputValue : 0);
    if (amount > 0) {
      this.stats.amountToSend = new Big(amount);
      this.dataService.calcChange(parseFloat(this.stats.amountToSend.times(globalConsts.GROTHS_IN_BEAM)),
        false, this.selectedAssetValue.asset_id);
    }
  }

  resetStats() {
    this.stats.amountToSend = new Big(0);
    this.stats.change = new Big(0);
    this.stats.fee = new Big(this.stats.fee);
    this.stats.asset_change = new Big(0);
    this.stats.remaining = new Big(this.status.available).div(globalConsts.GROTHS_IN_BEAM);
    this.stats.beam_remaining = new Big(this.globalStatus.totals[0].available).div(globalConsts.GROTHS_IN_BEAM);
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
    this.componentParams.isSendDataValid = this.componentParams.isAddressInputValid &&
      this.componentParams.addressValidation &&
      this.componentParams.isEnoughAmount;
  }

  public commentControlClicked() {
    this.componentParams.commentExpanded = !this.componentParams.commentExpanded;
  }

  public feeControlClicked() {
    this.componentParams.feeExpanded = !this.componentParams.feeExpanded;
  }

  public switcherClicked(event, value:string) {
    this.componentParams.switcherSelectedValue = value;
    //this.createAddress();
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
    this.fullSendForm.controls['amount'].setValue(0);
    const asset = this.globalStatus.totals.find(value => value.asset_id === this.selectedAssetValue.asset_id);
      if (asset) {
        this.status = asset;
        this.stats.remaining = new Big(asset.available).div(globalConsts.GROTHS_IN_BEAM);
        this.stats.beam_remaining = new Big(this.globalStatus.totals[0].available).div(globalConsts.GROTHS_IN_BEAM);
      }
    this.componentParams.isAssetDropdownVisible = false;
  }
}
