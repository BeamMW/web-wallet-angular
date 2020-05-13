import { Component, OnInit, OnDestroy } from '@angular/core';
import {Router} from '@angular/router';
import { ActivatedRoute} from '@angular/router';
import { DataService, WindowService } from './../../../../services';
import { environment } from '@environment';
import { routes } from '@consts';

@Component({
  selector: 'app-restore-wallet-popup',
  templateUrl: './restore-wallet-popup.component.html',
  styleUrls: ['./restore-wallet-popup.component.scss']
})
export class RestoreWalletPopupComponent implements OnInit, OnDestroy {
  isFullScreen = false;
  popupOpened = false;
  popupCloseIcon: string = `${environment.assetsPath}/images/shared/components/popups/payment-proof/ic-cancel-popup.svg`;

  constructor(private windowSerivce: WindowService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private dataService: DataService) {
    this.isFullScreen = windowSerivce.isFullSize();

    dataService.changeEmitted$.subscribe(emittedState => {
      if (emittedState.popupOpened !== undefined) {
        this.popupOpened = emittedState.popupOpened;
      }
    });
  }

  ngOnInit() {
    this.dataService.emitChange({popupOpened: true});
  }

  ngOnDestroy() {
    this.dataService.emitChange({popupOpened: false});
  }

  submit($event) {
    $event.stopPropagation();
  }

  closePopup(event) {
    event.stopPropagation();
    this.router.navigate([{ outlets: { popup: null }}], {relativeTo: this.activatedRoute.parent});
  }
}
