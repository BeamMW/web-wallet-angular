import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router} from '@angular/router';
import { DataService, WindowService } from './../../../../services';
import { routes } from '@consts';

@Component({
  selector: 'app-save-seed-popup',
  templateUrl: './save-seed-popup.component.html',
  styleUrls: ['./save-seed-popup.component.scss']
})
export class SaveSeedPopupComponent implements OnInit, OnDestroy {
  isFullScreen = false;

  componentSettings = {
    navExtras: {
      seedConfirmed: false,
      seed: '',
      backLink: '',
      nextLink: '',
      isFromFTF: false,
      directionLink: ''
    }
  };

  constructor(private windowSerivce: WindowService,
              public router: Router,
              private activatedRoute: ActivatedRoute,
              private dataService: DataService) {
    this.isFullScreen = windowSerivce.isFullSize();

    try {
      const navigation = this.router.getCurrentNavigation();
      const state = navigation.extras.state as {
        seedConfirmed: boolean,
        seed: string,
        backLink: string,
        nextLink: string,
        isFromFTF: boolean,
        directionLink: string
      };
      this.componentSettings.navExtras = state;
    } catch (e) {
    }
  }

  ngOnInit() {
    this.dataService.emitChange({popupOpened: true});
  }

  ngOnDestroy() {
    this.dataService.emitChange({popupOpened: false});
  }

  submit($event) {
    $event.stopPropagation();

    if (this.componentSettings.navExtras.directionLink === routes.FTF_CONFIRM_SEED_ROUTE) {
      const navigationExtras: NavigationExtras = {
        state: {
          seed: this.componentSettings.navExtras.seed,
          backLink: this.componentSettings.navExtras.backLink,
          nextLink: this.componentSettings.navExtras.nextLink,
          isFromFTF: this.componentSettings.navExtras.isFromFTF
        }
      };
      this.router.navigate([routes.FTF_CONFIRM_SEED_ROUTE], navigationExtras);
    } else if (this.componentSettings.navExtras.directionLink === routes.FTF_PASSWORD_CREATE_ROUTE) {
      const navigationExtras: NavigationExtras = {
        state: {
          seedConfirmed: this.componentSettings.navExtras.seedConfirmed,
          seed: this.componentSettings.navExtras.seed,
          from: routes.FTF_VIEW_SEED_ROUTE
        }
      };
      this.router.navigate([routes.FTF_PASSWORD_CREATE_ROUTE], navigationExtras);
    }
  }

  cancelClicked($event) {
    $event.stopPropagation();
    this.closePopup();
  }

  closePopup(isCorrect = false) {
    this.router.navigate([{ outlets: { popup: null }}], {relativeTo: this.activatedRoute.parent});
  }
}

