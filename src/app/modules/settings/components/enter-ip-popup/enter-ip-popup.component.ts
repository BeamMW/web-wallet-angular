import { Component, OnInit, OnDestroy } from '@angular/core';
import {Router} from '@angular/router';
import { ActivatedRoute} from '@angular/router';
import { DataService, WindowService } from './../../../../services';
import { Subscription, Observable } from 'rxjs';
import { environment } from '@environment';
import { FormGroup, FormControl} from '@angular/forms';
import { Store } from '@ngrx/store';
import {
  updateIpSetting,
} from './../../../../store/actions/wallet.actions';
@Component({
  selector: 'app-enter-ip-popup',
  templateUrl: './enter-ip-popup.component.html',
  styleUrls: ['./enter-ip-popup.component.scss']
})
export class EnterIpPopupComponent implements OnInit, OnDestroy {
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
      ip: new FormControl()
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
    this.store.dispatch(updateIpSetting({settingValue: this.popupForm.value.ip}));
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
