import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
// import { storeCounter } from '../actions/wallet.actions';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { StorageMap } from '@ngx-pwa/local-storage';

@Injectable()
export class WalletEffects {
  constructor(private actions$: Actions, private storage: StorageMap) {}

  // setCounter$ = createEffect(
  //   () =>
  //     this.actions$.pipe(
  //       ofType(storeCounter),
  //       map(action => {
  //         this.storage.set('count', action.val).subscribe();
  //         console.log(action.val);
  //       })
  //     ),
  //   { dispatch: false }
  // );
}
