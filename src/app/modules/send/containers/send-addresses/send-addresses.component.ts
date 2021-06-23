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
      id: 'regular',
      name: 'Regular address',
      type: 'Regular'
    },
    'regular_new': {
      id: 'regular_new',
      name: 'Regular address',
      type: 'Regular'
    },
    'max_privacy': {
      id: 'max_privacy',
      name: 'Max privacy address',
      type: 'Max privacy'
    },
    'offline': {
      id: 'offline',
      name: 'Regular address',
      type: 'Offline'
    },
    'public_offline': {
      id: 'public_offline',
      name: 'Public offline address',
      type: 'Public offline'
    },
    'unknown': {
      id: '',
      name: '',
      type: ''
    }
  };

  private DEFAULT_ASSET = {
    asset_id: 0,
    metadata: {
      unit_name: 'BEAM'
    }
  }

  public sendForm: FormGroup;
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
    validationFullResult: {
      type: '',
      id: ''
    },
    isTypeVisible: false,
    isAssetDropdownVisible: false
  };

  public assets = [];
  public selectedAssetValue = {
    asset_id: 0,
    metadata: {
      unit_name: 'BEAM'
    }
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
    beam_remaining: 0,
    fee_formatted: ''
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
        this.componentParams.addressValidation = value.is_valid;
        this.componentParams.validationResult = this.addressTypes[value.type].name;
        this.componentParams.validationFullResult = this.addressTypes[value.type];
        this.componentParams.isTypeVisible = this.componentParams.validationResult === this.addressTypes['offline'].name;
        this.addressInputCheck();
        this.valuesValidationCheck(); 
      }
    }));

    this.sendForm = new FormGroup({
      address: new FormControl('',  [
        Validators.required
      ]),
      comment: new FormControl(''),
      amount: new FormControl('', [
        Validators.required
      ])
    });

    // try {
    //   const navigation = this.router.getCurrentNavigation();
    //   const state = navigation.extras.state as {
    //     address: string,
    //     amount: number
    //   };
      
    //   if (state.address.length > 0) {
    //     this.sendForm.get('address').setValue(state.address);
    //   }

    //   if (state.amount > 0) {
    //     this.sendForm.get('amount').setValue(state.amount);
    //   }
    // } catch (e) {}

    this.subscriptions.push(dataService.changeEmitted$.subscribe(emittedState => {
      this.componentParams.popupOpened = emittedState;
    }));

    this.assetsData$ = this.store.pipe(select(selectAssetsInfo));

    this.subscriptions.push(this.walletStatus$.subscribe((status) => {
      this.walletStatusLoading = false;
      this.globalStatus = status;

      this.assetsData$.subscribe(value => {
        const assets = value.map(asset=> {
          if(asset.asset_id > 0) {
            const assetFromStatus = status.totals.find(assetData => assetData.asset_id === asset.asset_id);
            if (assetFromStatus) {
              asset['status'] = assetFromStatus;
            }
          }

          return asset;
        });

        this.assets = [];
        this.assets.push(this.DEFAULT_ASSET)
        this.assets.push(...assets);
      }).unsubscribe();

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
          fee: changeValue.fee,
          fee_formatted: this.calcFromAssetValue(changeValue.fee).toFixed()
        });
        
        const amountInBig = new Big(this.values.amountToSend);
        if (this.values.amountToSend > 0) {
          if (this.selectedAssetStatus.available > 0) {
            const total = this.selectedAssetValue.asset_id === 0 
              ? amountInBig.plus(this.calcFromAssetValue(this.values.fee))
              : amountInBig;
            if (parseFloat(total) > 
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
      } else {
        const remaining = new Big(this.values.amountToSend).times(globalConsts.GROTHS_IN_BEAM) > 
          this.selectedAssetStatus.available - changeValue.fee ? 0 : 
            ((this.calcFromAssetValue(this.selectedAssetValue.asset_id == 0 ?
            (this.selectedAssetStatus.available - changeValue.fee) : this.selectedAssetStatus.available)
            .minus(this.values.amountToSend)).toFixed())

        this.updateValues({
          change: this.calcFromAssetValue(changeValue.change).toFixed(),
          asset_change: this.calcFromAssetValue(changeValue.asset_change).toFixed(),
          remaining: remaining,
          beam_remaining: this.calcFromAssetValue(this.globalStatus.totals[0].available - changeValue.fee).toFixed(),
          fee: changeValue.fee,
          fee_formatted: this.calcFromAssetValue(changeValue.fee).toFixed()
        });
      }
      this.valuesValidationCheck();
    }));
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
          address: this.sendForm.value.address,
          fee: this.values.fee,
          comment: this.sendForm.value.comment,
          amount: parseInt((new Big(this.sendForm.value.amount).times(globalConsts.GROTHS_IN_BEAM)).toFixed(), 10),
          isPassCheckEnabled: this.isPassCheckEnabled,
          asset_id: this.selectedAssetValue.asset_id,
          offline: this.componentParams.switcherSelectedValue === transactionTypes.offline,
          type: this.componentParams.validationFullResult.id === this.addressTypes.offline.id ? 
            (this.componentParams.switcherSelectedValue === transactionTypes.offline ? 'Offline' : 'Regular') :
            this.componentParams.validationFullResult.type,
          unit_name: this.selectedAssetValue.metadata.unit_name,
          remaining: this.values.remaining,
          change: this.values.change
        }
      };

      if (this.componentParams.isFullScreen) {
        this.router.navigate([this.router.url, { outlets: { popup: 'confirm-popup' }}], navigationExtras);
      } else {
        this.router.navigate([routes.SEND_CONFIRMATION_ROUTE], navigationExtras);
      }
    }
  }

  ngOnInit() {
    this.sendForm.get('amount').valueChanges.pipe(debounceTime(300)).subscribe(newValue => {
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
    let addAllAmount: Big;
    const fee = this.values.fee > 0 ? this.values.fee :
      (this.componentParams.switcherSelectedValue === this.componentParams.switcherValues.regular ? 
        globalConsts.MIN_FEE_VALUE : globalConsts.MIN_OFFLINE_FEE_VALUE);
    if (this.selectedAssetValue.asset_id === 0) {
      if (this.selectedAssetStatus.available > 0 && 
        this.selectedAssetStatus.available > fee) {
        addAllAmount = (new Big(this.selectedAssetStatus.available - fee))
          .div(globalConsts.GROTHS_IN_BEAM);
      }
    } else {
      addAllAmount = (new Big(this.selectedAssetStatus.available))
        .div(globalConsts.GROTHS_IN_BEAM);
    }

    this.addressInputCheck();
    this.sendForm.get('amount').setValue(addAllAmount.toFixed());
    //this.amountChanged(addAllAmount.toFixed());
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
        this.componentParams.switcherSelectedValue === transactionTypes.offline ||
        (this.componentParams.validationResult === this.addressTypes['max_privacy'].name ||
        this.componentParams.validationResult === this.addressTypes['public_offline'].name), this.selectedAssetValue.asset_id);
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
    this.componentParams.isEnoughAmount = true;
    this.componentParams.notEnoughtValue = 0;
  }

  public addressInputUpdated(value: string) {
    this.store.dispatch(loadAddressValidation({address: value}));
  }

  addressInputCheck() {
    this.componentParams.isAddressInputValid = (this.sendForm.value.address.length > 0 ||
      this.sendForm.value.address.length > 0) &&
      this.componentParams.addressValidation;
  }

  valuesValidationCheck() {
    this.componentParams.isSendDataValid = this.componentParams.isAddressInputValid &&
      this.componentParams.addressValidation && this.sendForm.value.amount > 0 &&
      this.componentParams.isEnoughAmount;
  }

  public commentControlClicked() {
    this.componentParams.commentExpanded = !this.componentParams.commentExpanded;
  }

  public switcherClicked(event, value:string) {
    this.componentParams.switcherSelectedValue = value;
    this.resetStats();
    this.sendForm.get('amount').setValue(this.sendForm.value.amount);
    //this.amountChanged(this.fullSendForm.value.amount);
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
    this.sendForm.controls['amount'].setValue(0);
    this.componentParams.isAssetDropdownVisible = false;
  }
}
