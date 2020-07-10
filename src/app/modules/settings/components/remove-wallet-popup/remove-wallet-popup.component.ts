import { Component, OnInit, OnDestroy } from '@angular/core';
import {Router} from '@angular/router';
import { ActivatedRoute} from '@angular/router';
import { DataService, WindowService } from './../../../../services';
import { Subscription, Observable } from 'rxjs';

@Component({
  selector: 'app-remove-wallet-popup',
  templateUrl: './remove-wallet-popup.component.html',
  styleUrls: ['./remove-wallet-popup.component.scss']
})
export class RemoveWalletPopupComponent implements OnInit, OnDestroy {
  wallet$: Observable<any>;
  sub: Subscription;
  isFullScreen = false;

  constructor(private windowSerivce: WindowService,
              public router: Router,
              private activatedRoute: ActivatedRoute,
              private dataService: DataService) {
    this.isFullScreen = windowSerivce.isFullSize();
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
    this.dataService.emitChange({popupOpened: false});
    this.router.navigate(['/settings/all', { outlets: { popup: 'remove-wallet-confirmation-popup' }}]);
  }

  cancelClicked($event) {
    $event.stopPropagation();
    this.closePopup();
  }

  closePopup() {
    this.router.navigate([{ outlets: { popup: null }}], {relativeTo: this.activatedRoute.parent});
  }
}
