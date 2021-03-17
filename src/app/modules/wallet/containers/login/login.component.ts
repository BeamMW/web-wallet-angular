import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import * as passworder from 'browser-passworder';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { DataService, WindowService } from './../../../../services';
import { environment } from '@environment';
import { Store, select } from '@ngrx/store';
import { ChangeWalletState } from './../../../../store/actions/wallet.actions';
import {
  selectError,
  selectWalletData
} from './../../../../store/selectors/wallet-state.selectors';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  public loginForm: FormGroup;
  public bgUrl: string = '';
  public logoUrl: string = `${environment.assetsPath}/images/modules/wallet/containers/login/logo.svg`;

  private sub: Subscription;

  wallet$: Observable<any>;
  wasmState$: Observable<any>;
  errorState$: Observable<any>;
  isCorrectPass = true;

  public params = {
    isFullScreen: false,
    popupOpened: false
  };

  constructor(private store: Store<any>,
              private windowService: WindowService,
              public router: Router,
              private dataService: DataService) {
    this.params.isFullScreen = windowService.isFullSize();
    this.bgUrl = `${environment.assetsPath}/images/modules/wallet/containers/login/` +
      (this.params.isFullScreen ? 'bg-full.svg' : 'bg.svg');
    this.loginForm = new FormGroup({
      password: new FormControl()
    });

    dataService.changeEmitted$.subscribe(emittedState => {
      if (emittedState.popupOpened !== undefined) {
        this.params.popupOpened = emittedState.popupOpened;
      }
    });
  }

  ngOnInit() {
    this.dataService.activateWallet();
    this.errorState$ = this.store.pipe(select(selectError));
  }

  ngOnDestroy() {
    if (this.sub !== undefined) {
      this.sub.unsubscribe();
    }
  }

  public submit(): void {
    const pass = this.loginForm.value.password;
    this.wallet$ = this.store.pipe(select(selectWalletData));
    this.wallet$.subscribe(wallet => {
      passworder.decrypt(pass, wallet).then((result) => {
        this.dataService.loginToService(result.seed, true, '', pass);
      }).catch(error => {
        this.isCorrectPass = false;
      });
      if (this.sub !== undefined) {
        this.sub.unsubscribe();
      }
    }).unsubscribe();
  }

  restoreClicked() {
    this.router.navigate([this.router.url, { outlets: { popup: 'restore-popup' }}]);
  }

  passUpdated($event) {
    this.isCorrectPass = true;
  }
}
