import { Injectable } from '@angular/core';
import {CanActivate} from '@angular/router';
import {Observable} from 'rxjs';
import { Router } from '@angular/router';
import { DataService } from './../../../services';
import { routes } from '@consts';

@Injectable({
    providedIn: 'root'
  })
export class InitializeGuard implements CanActivate {
    constructor(
        private dataService: DataService,
        public router: Router) {
    }

    public canActivate(): Observable<boolean> | boolean {
        this.dataService.loadWalletData().then(walletData => {
            if (walletData === undefined) {
                this.router.navigate([routes.FTF_CREATE_WALLET_ROUTE]);
                return false;
            }
        });

        return true;
    }
}
