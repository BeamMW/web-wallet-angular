import { Component, OnInit, OnDestroy } from '@angular/core';
import {Router} from '@angular/router';
import { ActivatedRoute} from '@angular/router';
import { DataService, WindowService, LoginService, WebsocketService } from './../../../../services';
import { Subscription, Observable } from 'rxjs';
import { FormGroup, FormControl} from '@angular/forms';
import * as passworder from 'browser-passworder';
import { Store, select } from '@ngrx/store';
import { selectWalletData } from './../../../../store/selectors/wallet-state.selectors';

@Component({
  selector: 'app-remove-wallet-confirmation-popup',
  templateUrl: './remove-wallet-confirmation-popup.component.html',
  styleUrls: ['./remove-wallet-confirmation-popup.component.scss']
})
export class RemoveWalletConfirmationPopupComponent implements OnInit, OnDestroy {
  wallet$: Observable<any>;
  sub: Subscription;
  confirmForm: FormGroup;
  isFullScreen = false;
  isCorrectPass = true;

  constructor(private windowSerivce: WindowService,
              private loginService: LoginService,
              private websocketService: WebsocketService,
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
    $event.stopPropagation();
    this.sub = this.wallet$.subscribe(wallet => {
      passworder.decrypt(this.confirmForm.value.password, wallet).then((result) => {
        this.loginService.disconnect();
        this.websocketService.disconnect();
        this.dataService.clearWalletData();
        this.dataService.getCoinsState.putState(false);
        this.router.navigate(['/initialize/create']);
      }).catch(error => {
        this.isCorrectPass = false;
      });
    });
  }

  cancelClicked($event) {
    $event.stopPropagation();
    this.closePopup();
  }

  closePopup() {
    this.router.navigate([{ outlets: { popup: null }}], {relativeTo: this.activatedRoute.parent});
  }

  passUpdated($event) {
    this.isCorrectPass = true;
  }
}
