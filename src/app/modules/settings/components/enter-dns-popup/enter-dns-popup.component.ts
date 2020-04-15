import { Component, OnInit, OnDestroy } from '@angular/core';
import {Router} from '@angular/router';
import { ActivatedRoute} from '@angular/router';
import { DataService, WindowService } from './../../../../services';
import { Subscription, Observable } from 'rxjs';
import { environment } from '@environment';
import { FormGroup, FormControl} from '@angular/forms';
import { Store, On } from '@ngrx/store';

import {
  updateDnsSetting
} from './../../../../store/actions/wallet.actions';
@Component({
  selector: 'app-enter-dns-popup',
  templateUrl: './enter-dns-popup.component.html',
  styleUrls: ['./enter-dns-popup.component.scss']
})
export class EnterDnsPopupComponent implements OnInit, OnDestroy {
  sub: Subscription;
  isFullScreen = false;
  popupForm: FormGroup;

  constructor(private windowSerivce: WindowService,
              private store: Store<any>,
              public router: Router,
              private activatedRoute: ActivatedRoute,
              private dataService: DataService) {
    this.isFullScreen = windowSerivce.isFullSize();
    this.popupForm = new FormGroup({
      dns: new FormControl()
    });
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
    this.store.dispatch(updateDnsSetting({settingValue: this.popupForm.value.dns}));
    this.dataService.saveWalletOptions();
    this.dataService.emitChange({popupOpened: false});
    this.router.navigate([{ outlets: { popup: null }}], {relativeTo: this.activatedRoute.parent});
  }

  cancelClicked($event) {
    $event.stopPropagation();
    this.closePopup();
  }

  closePopup() {
    this.router.navigate([{ outlets: { popup: null }}], {relativeTo: this.activatedRoute.parent});
  }
}

