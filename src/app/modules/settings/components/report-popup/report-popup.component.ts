import { Component, OnInit, OnDestroy } from '@angular/core';
import {Router} from '@angular/router';
import { ActivatedRoute} from '@angular/router';
import { DataService, WindowService, LogService } from './../../../../services';
import { Subscription, Observable } from 'rxjs';
import { environment } from '@environment';
import { FormGroup, FormControl} from '@angular/forms';
import { Store } from '@ngrx/store';
import {
  updateIpSetting,
} from './../../../../store/actions/wallet.actions';
@Component({
  selector: 'app-report-popup',
  templateUrl: './report-popup.component.html',
  styleUrls: ['./report-popup.component.scss']
})
export class ReportPopupComponent implements OnInit, OnDestroy {
  sub: Subscription;
  isFullScreen = false;
  popupForm: FormGroup;

  constructor(private windowSerivce: WindowService,
              private store: Store<any>,
              public router: Router,
              private logService: LogService,
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

  saveLogsClicked($event) {
    $event.stopPropagation();
    this.logService.saveLogsToFile();
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

  githubLinkClicked() {
    window.open('https://github.com/BeamMW', '_blank');
  }

  mailToClicked() {
    const mailText = 'mailto:support@beam.mw';
    window.location.href = mailText;
  }
}
