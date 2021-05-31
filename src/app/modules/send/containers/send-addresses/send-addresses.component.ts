import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { environment } from '@environment';
import { DataService, WindowService } from '@app/services';
import { Store, select } from '@ngrx/store';
import { 
  addressValidationLoaded,
  loadAddressValidation,
  calculatedChangeState
} from '@app/store/actions/wallet.actions';
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
  private walletStatusLoading = true;

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

  public selectedAssetStatus = {
    available: 0
  };
  private globalStatus = {
    totals: []
  };

  private subscriptions: Subscription[] = [];

  public values = {
    amountToSend: 0,
    change: 0,
    asset_change: 0,
    remaining: 0,
    fee: 0,
    beam_remaining: 0
  };

  constructor(private dataService: DataService,
              public router: Router,
              private store: Store<any>,
              private windowService: WindowService) {
    this.componentParams.isTypeVisible = false;
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
    this.subscriptions.push(this.addressValidation$.subscribe(value => {
      if (value) {
        this.componentParams.validationResult = this.addressTypes[value.type].name;
        this.componentParams.isTypeVisible = this.componentParams.validationResult === this.addressTypes['offline'].name; 
      }
    }));

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

    this.subscriptions.push(dataService.changeEmitted$.subscribe(emittedState => {
      this.componentParams.popupOpened = emittedState;
    }));

    this.subscriptions.push(this.walletStatus$.subscribe((status) => {
      this.walletStatusLoading = false;
      this.globalStatus = status;
      const selectedAssetData = status.totals.find(value => value.asset_id == this.selectedAssetValue.asset_id);
      if (selectedAssetData) {
        this.selectedAssetStatus = selectedAssetData;
      }
    }));

    this.calculatedChange$ = this.store.pipe(select(selectCalculatedChange));
    this.subscriptions.push(this.calculatedChange$.subscribe(changeValue => {
      if (changeValue.change) {
        this.updateValues({
          change: this.calcFromAssetValue(changeValue.change).toFixed(),
          asset_change: this.calcFromAssetValue(changeValue.asset_change).toFixed(),
          remaining: (this.calcFromAssetValue(this.selectedAssetValue.asset_id == 0 ?
            (this.selectedAssetStatus.available - changeValue.fee) : this.selectedAssetStatus.available)
            .minus(this.values.amountToSend)).toFixed(),
          beam_remaining: this.calcFromAssetValue(this.globalStatus.totals[0].available - changeValue.fee).toFixed(),
          fee: changeValue.fee
        });
        
        const amountInBig = new Big(this.values.amountToSend);
        if (this.values.amountToSend > 0) {
          if (this.selectedAssetStatus.available > 0) {
            if (parseFloat(amountInBig.plus(this.calcFromAssetValue(this.values.fee))) > 
                parseFloat(this.calcFromAssetValue(this.selectedAssetStatus.available))) {
              this.componentParams.isEnoughAmount = false;
              this.updateValues({
                remaining: 0,
                change: 0
              });
            } else {
              this.componentParams.isEnoughAmount = true;
            }
          } else {
            this.resetStats();
            this.componentParams.isEnoughAmount = false;
          }
          
          this.componentParams.notEnoughtValue = this.selectedAssetValue.asset_id == 0 ?
           amountInBig.plus(this.calcFromAssetValue(this.values.fee)).toFixed() : amountInBig.toFixed();
        } else if (this.selectedAssetValue.asset_id == 0 && changeValue.fee > this.selectedAssetStatus.available) {
            this.resetStats();
            this.componentParams.isEnoughAmount = false;
            this.componentParams.notEnoughtValue = this.calcFromAssetValue(changeValue.fee - 
              this.selectedAssetStatus.available).toFixed();    
        } else {
          this.componentParams.isEnoughAmount = true;
        }
      
        this.valuesValidationCheck();
      }
    }));

    this.assetsData$ = this.store.pipe(select(selectAssetsInfo));
    this.subscriptions.push(this.assetsData$.subscribe(value => {
      this.assets = [];
      this.assets.push(this.DEFAULT_ASSET)
      this.assets.push(...value);
    }));
  }

  submit() {
    if (this.componentParams.isSendDataValid) {
      const navigationExtras: NavigationExtras = {
        state: {
          address: this.sendForm.value.address,
          fee: this.sendForm.value.fee,
          amount: typeof this.sendForm.value.amount === 'string' ? this.sendForm.value.amount : this.sendForm.value.amount.toFixed(),
          comment: this.sendForm.value.comment,
          change: this.values.change.toFixed(),
          remaining: this.values.remaining.toFixed()
        }
      };
      this.router.navigate([routes.SEND_CONFIRMATION_ROUTE], navigationExtras);
    }
  }

  private calcFromAssetValue(value) {
    return new Big(value).div(globalConsts.GROTHS_IN_BEAM);
  }

  private updateValues(data: any) {
    this.values = { ...this.values, ...data };
  }

  public nextClicked($event: Event) {
    $event.stopPropagation();
    if (this.componentParams.isSendDataValid) {
      const navigationExtras: NavigationExtras = {
        state: {
          address: this.fullSendForm.value.address,
          fee: this.values.fee,
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

    this.fullSendForm.get('amount').valueChanges.pipe(debounceTime(300)).subscribe(newValue => {
      this.amountChanged(newValue);
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    
    this.store.dispatch(addressValidationLoaded({validationData: null}));
    this.store.dispatch(calculatedChangeState({changeValue: {
      asset_change: 0,
      change: 0,
      fee: globalConsts.MIN_FEE_VALUE
    }}));
  }

  backConfirmationClicked() {
    this.router.navigate([routes.WALLET_MAIN_ROUTE]);
  }

  addAllClicked($event) {
    if (this.selectedAssetStatus.available > 0 && 
        this.selectedAssetStatus.available > this.calcFromAssetValue(this.values.fee).toFixed()) {
      const allAmount = (new Big(this.selectedAssetStatus.available - this.values.fee))
        .div(globalConsts.GROTHS_IN_BEAM);
      this.addressInputCheck();
      this.fullSendForm.get('amount').setValue(allAmount.toFixed());
    }
  }

  private amountChanged(amountInputValue) {
    this.resetStats();
    const amount = parseFloat(amountInputValue.length > 0 ? amountInputValue : 0);
    if (amount > 0) {
      if (this.selectedAssetValue.asset_id == 0) {
        const amountInBig = new Big(amountInputValue);
        const fee = this.calcFromAssetValue(this.componentParams.switcherSelectedValue === 
          this.componentParams.switcherValues.regular ? globalConsts.MIN_FEE_VALUE : 
          globalConsts.MIN_OFFLINE_FEE_VALUE);
        const fullAmount = amountInBig.plus(fee).toFixed();
        const fullAvailable = (this.calcFromAssetValue(this.selectedAssetStatus.available)).toFixed()
        if (parseFloat(fullAmount) > parseFloat(fullAvailable)) {
          this.componentParams.isEnoughAmount = false;
          this.updateValues({
            remaining: 0,
            change: 0
          });
          this.componentParams.notEnoughtValue = amountInBig.plus(fee).toFixed();
        }
      }

      this.values.amountToSend = amount;
      this.dataService.calcChange(parseFloat(new Big(this.values.amountToSend).times(globalConsts.GROTHS_IN_BEAM)),
        this.componentParams.switcherSelectedValue === transactionTypes.offline, this.selectedAssetValue.asset_id);
    } else {
      this.componentParams.isEnoughAmount = true;
    }
  }

  private resetStats() {
    this.values.amountToSend = 0;
    this.values.change = 0;
    this.values.fee = 0;
    this.values.asset_change = 0;
    this.values.remaining = new Big(!this.walletStatusLoading ? this.selectedAssetStatus.available : 0)
      .div(globalConsts.GROTHS_IN_BEAM);
    this.values.beam_remaining = new Big(!this.walletStatusLoading ? this.globalStatus.totals[0].available : 0)
      .div(globalConsts.GROTHS_IN_BEAM);
  }

  public addressInputUpdated(value: string) {
    this.store.dispatch(loadAddressValidation({address: value}));

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

  public switcherClicked(event, value:string) {
    this.componentParams.switcherSelectedValue = value;
    this.dataService.calcChange(parseFloat(new Big(this.values.amountToSend).times(globalConsts.GROTHS_IN_BEAM)),
      value === transactionTypes.offline, this.selectedAssetValue.asset_id);
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
    const selectedAssetData = this.globalStatus.totals.find(value => value.asset_id == this.selectedAssetValue.asset_id);
    if (selectedAssetData) {
      this.selectedAssetStatus = selectedAssetData;
    }
    this.fullSendForm.controls['amount'].setValue(0);
    this.componentParams.isAssetDropdownVisible = false;
  }
}
