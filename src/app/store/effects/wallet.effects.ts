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
  saveWalletStatus } from '../actions/wallet.actions';
import { map, tap, mergeMap, catchError } from 'rxjs/operators';
import { StorageMap } from '@ngx-pwa/local-storage';
import { DataService, WasmService } from '../../services';
import { rpcMethodIdsConsts, globalConsts } from '@consts';
import { Store, select } from '@ngrx/store';
import {
  selectWalletSetting,
  selectVerificatedSetting
} from '../selectors/wallet-state.selectors';

@Injectable()
export class WalletEffects {
  constructor(private actions$: Actions, 
    private dataService: DataService, 
    private wasmService:WasmService, 
    private store: Store<any>,
    private storage: StorageMap) {}

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
            console.log(parsedResponse);
            this.store.dispatch(addressValidationLoaded({validationData: parsedResponse.result}));
          } else if (parsedResponse.id === rpcMethodIdsConsts.WALLET_STATUS_ID) {
            this.store.dispatch(saveWalletStatus({status: parsedResponse.result}));
      
            console.log(parsedResponse.result);

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
          } else if (parsedResponse.id === rpcMethodIdsConsts.GET_ASSET_INFO) {
            console.log('ASSET INFO:', parsedResponse);
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
          } else if (parsedResponse.id === rpcMethodIdsConsts.CALC_CHANGE_ID) {
            console.log('CHANGE:', parsedResponse)
            
            this.store.dispatch(calculatedChangeState({changeValue: {
              asset_change: parsedResponse.result.asset_change,
              change: parsedResponse.result.change,
              fee: parsedResponse.result.explicit_fee
            }}));
          } else if (parsedResponse.id === rpcMethodIdsConsts.CREATE_ADDRESS_ID) {
          
          }
        });
      })
    ),
    { dispatch: false }
  );
}
