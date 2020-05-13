import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import * as passworder from 'browser-passworder';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { DataService, WindowService } from './../../../../services';
import { environment } from '@environment';
import { Store, select } from '@ngrx/store';
import { ChangeWalletState } from './../../../../store/actions/wallet.actions';
import { selectWalletData } from './../../../../store/selectors/wallet-state.selectors';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  public loginForm: FormGroup;
  public isFullScreen: boolean;
  public bgUrl: string = '';
  public logoUrl: string = `${environment.assetsPath}/images/modules/wallet/containers/login/logo.svg`;

  wallet$: Observable<any>;
  wasmState$: Observable<any>;

  isCorrectPass = true;

  constructor(private store: Store<any>,
              private windowService: WindowService,
              public router: Router,
              private dataService: DataService) {
    this.isFullScreen = windowService.isFullSize();
    this.bgUrl = `${environment.assetsPath}/images/modules/wallet/containers/login/` +
      (this.isFullScreen ? 'bg-full.svg' : 'bg.svg');
    this.loginForm = new FormGroup({
      password: new FormControl()
    });
  }

  ngOnInit() {
    this.dataService.loadWalletSettings();
    this.dataService.loadWalletContacts();
  }

  ngOnDestroy() {}

  public submit(): void {
    const pass = this.loginForm.value.password;
    this.wallet$ = this.store.pipe(select(selectWalletData));
    this.wallet$.subscribe(wallet => {
      passworder.decrypt(pass, wallet).then((result) => {
        this.dataService.loginToService(result.seed, true, result.id, pass);
      }).catch(error => {
        this.isCorrectPass = false;
      });
    });
  }

  passUpdated($event) {
    this.isCorrectPass = true;
  }
}
