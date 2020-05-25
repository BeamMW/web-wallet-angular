import { Component, OnInit, OnDestroy } from '@angular/core';
import {Router} from '@angular/router';
import { environment } from '@environment';
import { ActivatedRoute} from '@angular/router';
import { DataService } from './../../../../services/data.service';
import { selectReceiveData } from './../../../../store/selectors/wallet-state.selectors';
import { Subscription, Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';

@Component({
  selector: 'app-qr-popup',
  templateUrl: './qr-popup.component.html',
  styleUrls: ['./qr-popup.component.scss']
})
export class QrPopupComponent implements OnInit, OnDestroy {
  public iconClose = `${environment.assetsPath}/images/modules/receive/components/qr-popup/ic-cancel.svg`;
  receiveData$: Observable<any>;
  isSnackbarVisible = false;

  constructor(private store: Store<any>,
              public router: Router,
              private activatedRoute: ActivatedRoute,
              private dataService: DataService) {
    this.receiveData$ = this.store.pipe(select(selectReceiveData));
  }

  ngOnInit() {
    this.dataService.emitChange(true);
  }

  ngOnDestroy() {
    this.dataService.emitChange(false);
  }

  closePopup() {
    this.router.navigate([{ outlets: { popup: null }}], {relativeTo: this.activatedRoute.parent});
  }

  dataToQr(value) {
    return 'beam:' + value.address + (value.amount ? ('?amount=' + value.amount) : '') +
      (value.comment && value.comment.length > 0 ? ('?comment=' + value.comment) : '');
  }

  copyTokenClicked() {
    this.isSnackbarVisible = true;
    setTimeout(() => {
      this.isSnackbarVisible = false;
    }, 3000);
    // this.closePopup();
  }
}
