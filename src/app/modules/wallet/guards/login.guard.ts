import { Injectable } from '@angular/core';
import {CanActivate} from '@angular/router';
import {Observable, Subscription} from 'rxjs';
import { Router } from '@angular/router';
import { DataService } from './../../../services/data.service';
import { Store, select } from '@ngrx/store';
import { selectWalletState, selectWalletData } from '../../../store/selectors/wallet-state.selectors';
import { saveWallet, ChangeWalletState } from '../../../store/actions/wallet.actions';

@Injectable({
    providedIn: 'root'
  })
export class LoginGuard implements CanActivate {
    private walletState$: Observable<any>;
    private walletData$: Observable<any>;
    private sub: Subscription;
    private walletSub: Subscription;

    constructor(
        private store: Store<any>,
        private dataService: DataService,
        public router: Router) {
    }

    public canActivate(): Observable<boolean> | boolean {
        this.walletData$ = this.store.pipe(select(selectWalletData));
        this.walletSub = this.walletData$.subscribe((state) => {
            if (state.length > 0) {
                this.store.dispatch(ChangeWalletState({walletState: true}));
                if (this.walletSub !== undefined) {
                    this.walletSub.unsubscribe();
                }
            } else {
                this.router.navigate(['/initialize/create']);
                return false;
            }
        });

        this.walletState$ = this.store.pipe(select(selectWalletState));
        this.sub = this.walletState$.subscribe((state) => {
            if (!state) {
                if (this.sub !== undefined) {
                    this.sub.unsubscribe();
                }
                this.router.navigate(['/wallet/login']);
                return false;
            }
        });

        return true;
    }
}
