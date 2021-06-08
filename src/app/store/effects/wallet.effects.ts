import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { 
  loadAddressValidation,
  updateWalletData,
  addressValidationLoaded,
  updateVerificatedSetting,
  loadAssetsData,
  calculatedChangeState,
  isWalletLoadedState,
  loadTr,
  loadUtxo,
  saveWalletStatus } from '../actions/wallet.actions';
import { map, tap, mergeMap, catchError } from 'rxjs/operators';
import { StorageMap } from '@ngx-pwa/local-storage';
import { DataService, WasmService } from '../../services';
import { rpcMethodIdsConsts, globalConsts, routes } from '@consts';
import { Store, select } from '@ngrx/store';
import {
  selectWalletSetting,
  selectVerificatedSetting
} from '../selectors/wallet-state.selectors';
import {
  loadAddresses
} from '../actions/wallet.actions';
import { Router } from '@angular/router';
import { 
  selectAssetsInfo 
} from '@app/store/selectors/wallet-state.selectors';
import { Observable } from 'rxjs';
import { environment } from '@environment';

@Injectable()
export class WalletEffects {
  assets$: Observable<any>;
  
  constructor(private actions$: Actions, 
    private dataService: DataService, 
    private wasmService:WasmService,
    public router: Router,
    private store: Store<any>,
    private storage: StorageMap) {
      this.assets$ = this.store.pipe(select(selectAssetsInfo));
  }

  validateAddress$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadAddressValidation),
      tap((action) => {
        this.dataService.validateAddress(action.address)
      })
    ),
    { dispatch: false }
  );

  updateWalletData$ = createEffect(() =>
    () => this.actions$.pipe(
      ofType(updateWalletData),
      map((action) => {
        const beamValue = 100 * globalConsts.GROTHS_IN_BEAM;
        this.wasmService.wallet.subscribe((response) => {
          const parsedResponse = JSON.parse(response);
          if (parsedResponse.id === rpcMethodIdsConsts.VALIDATE_ADDRESS) {
            console.log('[Address validation]:',parsedResponse);
            this.store.dispatch(addressValidationLoaded({validationData: parsedResponse.result}));
          } else if (parsedResponse.id === rpcMethodIdsConsts.WALLET_STATUS_ID) {
            this.store.dispatch(saveWalletStatus({status: parsedResponse.result}));
      
            console.log('[Status]:', parsedResponse.result);

            if (parsedResponse.result.totals) {
              if (parsedResponse.result.totals.length > 1) {
                this.dataService.assetsCount = parsedResponse.result.totals.length - 1;
                this.dataService.loadAssetsInfo(parsedResponse.result.totals);
              } else {
                this.dataService.isAssetsInfoLoading = false;
              }

              const beamTotals = parsedResponse.result.totals.find(value => value.asset_id === 0);

              if (beamTotals.receiving > 0 || beamTotals.available > 0) {
                const verificatedSetting$ = this.store.pipe(select(selectVerificatedSetting));
                verificatedSetting$.subscribe((verState) => {
                  if (!verState.balanceWasPositive) {
                    this.store.dispatch(updateVerificatedSetting({settingValue: {
                      state: verState.state,
                      isMessageClosed: verState.isMessageClosed,
                      balanceWasPositive: true,
                      balanceWasPositiveMoreEn: verState.balanceWasPositiveMoreEn
                    }}));
                  }
        
                  if (!verState.balanceWasPositiveMoreEn 
                      && (beamTotals.receiving >= beamValue || beamTotals.available >= beamValue)) {
                    this.store.dispatch(updateVerificatedSetting({settingValue: {
                      state: verState.state,
                      isMessageClosed: verState.isMessageClosed,
                      balanceWasPositive: verState.balanceWasPositive,
                      balanceWasPositiveMoreEn: true
                    }}));
                  }

                  this.wasmService.saveWalletOptions();
                }).unsubscribe();
              }
            }
          } else if (parsedResponse.id === rpcMethodIdsConsts.GET_ASSET_INFO) {
            if (parsedResponse.error === undefined) {
              console.log('[Asset info]:', parsedResponse);
              this.dataService.assetsReqCount++;
              const assetMetadata = this.dataService.getAssetMetadata(parsedResponse.result.metadata);
              if (this.dataService.assetsReqCount === this.dataService.assetsCount) {
                this.dataService.assetsReqCount = 0;
                this.dataService.assetsInfoTmp.push({
                  ...parsedResponse.result,
                  metadata: assetMetadata
                });
                this.store.dispatch(loadAssetsData({assets: this.dataService.assetsInfoTmp}));
                this.dataService.isAssetsInfoLoading = false;
                this.dataService.assetsInfoTmp = [];
              } else {
                this.dataService.assetsInfoTmp.push({
                  ...parsedResponse.result,
                  metadata: assetMetadata
                });
              }
            }
          } else if (parsedResponse.id === rpcMethodIdsConsts.CALC_CHANGE_ID) {
            console.log('[Change]:', parsedResponse)
            
            this.store.dispatch(calculatedChangeState({changeValue: {
              asset_change: parsedResponse.result.asset_change,
              change: parsedResponse.result.change,
              fee: parsedResponse.result.explicit_fee
            }}));
          } else if (parsedResponse.id === rpcMethodIdsConsts.CREATE_ADDRESS_ID) {
          
          } else if (parsedResponse.id === rpcMethodIdsConsts.ADDR_LIST_ID) {
            console.log('[Adresses]:', parsedResponse.result)
            this.store.dispatch(loadAddresses({addresses: parsedResponse.result.length > 0 ? parsedResponse.result : []}));           
          } else if (parsedResponse.id === rpcMethodIdsConsts.TX_LIST_ID) {
            console.log('[Transactions]: ', parsedResponse.result);
            let transactions = parsedResponse.result.map(value => {
              value['metadata'] = {
                unit_name: '',
                icon_path: ''
              }
              if (value.asset_id > 0) {
                this.assets$.subscribe(assets => {
                  if (assets.length > 0) {
                    const asset = assets.find(elem => elem.asset_id === value.asset_id);
                    if (asset) {
                      value.metadata = asset.metadata;
                      value.metadata.icon_path = `${environment.assetsPath}/images/modules/wallet/components/card/${
                        ('asset-' + value.asset_id)}.svg`;
                    }
                  }
                });
              } else {
                value.metadata.unit_name = 'BEAM';
                value.metadata.icon_path = `${environment.assetsPath}/images/modules/wallet/components/card/icon-beam.svg`;
              }
              
              return value;
            });

            this.store.dispatch(loadTr({transactions: transactions}));
            this.store.dispatch(isWalletLoadedState({loadState: false}));
            console.log('--------------------update finished--------------------');
          } else if (parsedResponse.id === rpcMethodIdsConsts.GET_UTXO_ID) {
            console.log('[Utxos]: ', parsedResponse.result);

            this.store.dispatch(loadUtxo({utxos: parsedResponse.result.length > 0 ? parsedResponse.result : []}));
          } else if (parsedResponse.id === rpcMethodIdsConsts.TX_SEND_ID) {
            console.log('[Send]: ', parsedResponse);
            this.router.navigate([routes.WALLET_MAIN_ROUTE]);
          } else if (parsedResponse.id === rpcMethodIdsConsts.TX_CANCEL_ID) {
            console.log('[Transaction cancelled]', parsedResponse);
          } else if (parsedResponse.id === rpcMethodIdsConsts.TX_DELETE_ID) {
            console.log('[Transaction deleted]', parsedResponse);
          } 
        });
      })
    ),
    { dispatch: false }
  );
}
