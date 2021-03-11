import { Component, OnInit, OnDestroy } from '@angular/core';
import {Router} from '@angular/router';
import { ActivatedRoute} from '@angular/router';
import { DataService, WindowService } from './../../../../services';
import { WasmService } from '../../../../services/wasm.service';
import { Subscription, Observable, from } from 'rxjs';
import { FormGroup, FormControl} from '@angular/forms';
import * as passworder from 'browser-passworder';
import { Store, select } from '@ngrx/store';
import { selectWalletData } from './../../../../store/selectors/wallet-state.selectors';

@Component({
  selector: 'app-show-owner-key-popup',
  templateUrl: './show-owner-key-popup.component.html',
  styleUrls: ['./show-owner-key-popup.component.scss']
})
export class ShowOwnerKeyPopupComponent implements OnInit, OnDestroy {
  wallet$: Observable<any>;
  sub: Subscription;
  confirmForm: FormGroup;
  isFullScreen = false;
  isCorrectPass = true;
  isPassValidated = false;
  isNewPassValidated = true;
  emptyPass = false;
  emptyConfirmPass = false;
  isSameOld = false;

  ownerKey = '';

  private walletData: any;

  constructor(private windowSerivce: WindowService,
              public router: Router,
              private wasmService: WasmService,
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
    this.wallet$.subscribe(wallet => {
      passworder.decrypt(this.confirmForm.value.password, wallet).then((result) => {
        this.isPassValidated = true;
        this.ownerKey = this.wasmService.keyKeeper.getOwnerKey(this.confirmForm.value.password);
        this.walletData = result;
      }).catch(error => {
        this.isCorrectPass = false;
      });
    });
  }

  validatedSubmit($event) {
    $event.stopPropagation();
    this.closePopup();
    // const newPass = this.confirmForm.value.newPassword;
    // const newPassConfirm = this.confirmForm.value.newPasswordConfirm;
    // const oldPass = this.confirmForm.value.password;
    // $event.stopPropagation();
    // if (newPass === newPassConfirm && (newPass !== null && newPass.length > 0)) {
    //   if (newPass !== oldPass) {
    //     this.dataService.changePassword(newPass, this.walletData.seed, this.walletData.id);
    //     this.closePopup();
    //   } else {
    //     this.isSameOld = true;
    //   }
    // } else if (newPass === null || newPassConfirm === null || newPass === 0 || newPassConfirm === 0) {
    //   this.emptyPass = newPass === 0 || newPass === null;
    //   this.emptyConfirmPass = newPassConfirm === 0 || newPassConfirm === null;
    // } else {
    //   this.isNewPassValidated = false;
    // }
  }

  passInputUpdated(event) {
    this.emptyPass = false;
    this.emptyConfirmPass = false;
    this.isNewPassValidated = true;
    this.isSameOld = false;
  }

  cancelClicked($event) {
    $event.stopPropagation();
    this.closePopup();
  }

  closePopup(isCorrect = false) {
    this.router.navigate([{ outlets: { popup: null }}], {relativeTo: this.activatedRoute.parent});
  }

  passUpdated($event) {
    this.isCorrectPass = true;
  }
}
