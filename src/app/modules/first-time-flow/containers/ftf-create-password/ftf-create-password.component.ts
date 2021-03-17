import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from '@environment';
import { Router, NavigationExtras } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import { DataService, WindowService } from './../../../../services';
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
  private fromRoute: string;

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
      public router: Router,
      private windowService: WindowService,
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
        seed: string,
        from: string
      };
      this.seedConfirmed = state.seedConfirmed;
      this.seed = state.seed;
      this.fromRoute = state.from;
    } catch (e) {
      this.backClicked();
    }

    dataService.changeEmitted$.subscribe(emittedState => {
      if (emittedState.popupOpened !== undefined) {
        this.localParams.popupOpened = emittedState.popupOpened;
      }
    });
  }

  ngOnInit() {
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

  backClicked() {
    if (this.fromRoute === routes.FTF_VIEW_SEED_ROUTE) {
      this.router.navigate([this.router.url, { outlets: { popup: 'return-to-seed' }}]); 
    } else if (this.fromRoute === routes.FTF_WALLET_RESTORE_ROUTE) {
      this.router.navigate([routes.FTF_WALLET_RESTORE_ROUTE]);
    }
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
