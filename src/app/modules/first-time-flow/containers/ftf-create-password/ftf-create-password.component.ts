import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from '@environment';
import { Router, NavigationExtras } from '@angular/router';
import { WasmService } from '../../../../services/wasm.service';
import { Store, select } from '@ngrx/store';
import { selectWasmState } from '../../../../store/selectors/wallet-state.selectors';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import * as passworder from 'browser-passworder';
import { DataService, WindowService, LoginService, WebsocketService } from './../../../../services';
import { ChangeWalletState } from './../../../../store/actions/wallet.actions';

import { routes } from '@consts';

@Component({
  selector: 'app-ftf-create-password',
  templateUrl: './ftf-create-password.component.html',
  styleUrls: ['./ftf-create-password.component.scss']
})
export class FtfCreatePasswordComponent implements OnInit, OnDestroy {
  public iconBack: string = `${environment.assetsPath}/images/modules/send/containers/send-addresses/icon-back.svg`;

  private seedConfirmed: boolean;
  private seed: string;

  private sub: Subscription;
  private keeperSub: Subscription;
  public createForm: FormGroup;

  public localParams = {
    isFullScreen: false,
    isNewPassValidated: true,
    emptyPass: false,
    emptyConfirmPass: false,
    popupOpened: false
  };

  private wasmState$: Observable<any>;

  constructor(
      private store: Store<any>,
      private wasmService: WasmService,
      public router: Router,
      private websocketService: WebsocketService,
      private windowService: WindowService,
      private loginService: LoginService,
      private dataService: DataService) {
    this.localParams.isFullScreen = this.windowService.isFullSize();
    this.createForm = new FormGroup({
      password: new FormControl('', Validators.required),
      passwordConfirm: new FormControl('', Validators.required)
    });

    try {
      const navigation = this.router.getCurrentNavigation();
      const state = navigation.extras.state as {
        seedConfirmed: boolean,
        seed: string
      };
      this.seedConfirmed = state.seedConfirmed;
      this.seed = state.seed;
    } catch (e) {
        this.router.navigate([routes.FTF_VIEW_SEED_ROUTE]);
    }

    dataService.changeEmitted$.subscribe(emittedState => {
      if (emittedState.popupOpened !== undefined) {
        this.localParams.popupOpened = emittedState.popupOpened;
      }
    });
  }

  ngOnInit() {
    //this.dataService.loginToService(this.seed, false, '', '');
  }

  public submit(): void {
    const pass = this.createForm.value.password;
    const confirmPass = this.createForm.value.passwordConfirm;

    if (confirmPass === pass && (pass !== null && pass.length > 0)) {
      const navigationExtras: NavigationExtras = {
        state: {
          seed: this.seed,
          pass,
          seedConfirmed: this.seedConfirmed
        }
      };
      this.router.navigate([routes.FTF_CREATE_LOADER], navigationExtras);
    } else if (pass === null || confirmPass === null ||
        pass.length === 0 || confirmPass.length === 0) {
      this.localParams.emptyPass = pass.length === 0 || pass === null;
      this.localParams.emptyConfirmPass = confirmPass.length === 0 || confirmPass === null;
    } else {
      this.localParams.isNewPassValidated = false;
    }
  }

  passInputUpdated(event) {
    this.localParams.emptyPass = false;
    this.localParams.emptyConfirmPass = false;
    this.localParams.isNewPassValidated = true;
  }

  backClicked(event) {
    event.stopPropagation();
    this.router.navigate([this.router.url, { outlets: { popup: 'return-to-seed' }}]);
  }

  ngOnDestroy() {
    if (this.sub !== undefined) {
      this.sub.unsubscribe();
    }

    if (this.keeperSub) {
      this.keeperSub.unsubscribe();
    }
  }
}
