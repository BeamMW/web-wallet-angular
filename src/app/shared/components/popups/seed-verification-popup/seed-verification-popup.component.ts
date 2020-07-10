import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router} from '@angular/router';
import { DataService, WindowService } from './../../../../services';
import { Subscription, Observable } from 'rxjs';
import { FormGroup, FormControl} from '@angular/forms';
import * as passworder from 'browser-passworder';
import { Store, select } from '@ngrx/store';
import { selectWalletData } from './../../../../store/selectors/wallet-state.selectors';
import { routes } from '@consts';

@Component({
  selector: 'app-seed-verification-popup',
  templateUrl: './seed-verification-popup.component.html',
  styleUrls: ['./seed-verification-popup.component.scss']
})
export class SeedVerificationPopupComponent implements OnInit, OnDestroy {
  wallet$: Observable<any>;
  sub: Subscription;
  confirmForm: FormGroup;
  isFullScreen = false;
  isCorrectPass = true;

  constructor(private windowSerivce: WindowService,
              public router: Router,
              private activatedRoute: ActivatedRoute,
              private store: Store<any>,
              private dataService: DataService) {
    this.isFullScreen = windowSerivce.isFullSize();
    this.confirmForm = new FormGroup({
      password: new FormControl()
    });
    this.wallet$ = this.store.pipe(select(selectWalletData));
  }

  ngOnInit() {
    this.dataService.emitChange({popupOpened: true});
  }

  ngOnDestroy() {
    this.dataService.emitChange({popupOpened: false});
    if (this.sub !== undefined) {
      this.sub.unsubscribe();
    }
  }

  submit($event) {
    this.wallet$.subscribe(wallet => {
      passworder.decrypt(this.confirmForm.value.password, wallet).then((result) => {
        const navigationExtras: NavigationExtras = {
          state: {
            seed: result.seed,
            backLink: routes.WALLET_MAIN_ROUTE,
            nextLink: routes.WALLET_MAIN_ROUTE,
            isFromFTF: false
          }
        };
        this.closePopup(true);
        this.router.navigate([routes.FTF_VIEW_SEED_ROUTE], navigationExtras);
      }).catch(error => {
        this.isCorrectPass = false;
      });
    });
  }

  cancelClicked($event) {
    $event.stopPropagation();
    this.closePopup();
  }

  closePopup(isCorrect = false) {
    this.router.navigate([{ outlets: { popup: null }}], {relativeTo: this.activatedRoute.parent});
  }

  inputUpdated() {
    this.isCorrectPass = true;
  }
}
