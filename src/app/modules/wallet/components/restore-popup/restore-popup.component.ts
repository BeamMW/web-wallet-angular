import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router} from '@angular/router';
import { DataService, WindowService } from './../../../../services';
import { routes } from '@consts';

@Component({
  selector: 'app-restore-popup',
  templateUrl: './restore-popup.component.html',
  styleUrls: ['./restore-popup.component.scss']
})
export class RestorePopupComponent implements OnInit {
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
  }

  submit($event) {
    $event.stopPropagation();

    const navigationExtras: NavigationExtras = {
      state: {
        from: routes.WALLET_LOGIN_ROUTE,
      }
    };
    this.router.navigate([routes.FTF_WALLET_RESTORE_ROUTE], navigationExtras);
  }

  cancelClicked($event) {
    $event.stopPropagation();
    this.closePopup();
  }

  closePopup(isCorrect = false) {
    this.router.navigate([{ outlets: { popup: null }}], {relativeTo: this.activatedRoute.parent});
  }
}