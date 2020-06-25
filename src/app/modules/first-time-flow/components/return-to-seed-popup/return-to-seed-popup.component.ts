import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router} from '@angular/router';
import { DataService, WindowService } from './../../../../services';
import { routes } from '@consts';

@Component({
  selector: 'app-return-to-seed-popup',
  templateUrl: './return-to-seed-popup.component.html',
  styleUrls: ['./return-to-seed-popup.component.scss']
})
export class ReturnToSeedPopupComponent implements OnInit {
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

    this.router.navigate([routes.FTF_VIEW_SEED_ROUTE]);
  }

  cancelClicked($event) {
    $event.stopPropagation();
    this.closePopup();
  }

  closePopup(isCorrect = false) {
    this.router.navigate([{ outlets: { popup: null }}], {relativeTo: this.activatedRoute.parent});
  }
}

///    this.router.navigate([routes.FTF_VIEW_SEED_ROUTE]);