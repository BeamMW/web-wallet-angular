import { Component, OnInit, OnDestroy } from '@angular/core';
import {Router} from '@angular/router';
import { ActivatedRoute} from '@angular/router';
import { DataService, WindowService } from '@app/services';
import { Subscription, Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { selectProofData } from '@app/store/selectors/wallet-state.selectors';
import { environment } from '@environment';
import { globalConsts } from '@consts';

@Component({
  selector: 'app-payment-proof-exported',
  templateUrl: './payment-proof-exported.component.html',
  styleUrls: ['./payment-proof-exported.component.scss']
})
export class PaymentProofExportedComponent implements OnInit, OnDestroy {
  sub: Subscription;
  isFullScreen = false;
  proofLoaded = false;
  proofData: any;
  scrollOffset = 0;
  proofData$: Observable<any>;

  popupCloseIcon: string = `${environment.assetsPath}/images/shared/components/popups/payment-proof/ic-cancel-popup.svg`;

  constructor(private windowSerivce: WindowService,
              private router: Router,
              private store: Store<any>,
              private activatedRoute: ActivatedRoute,
              private dataService: DataService) {
    this.isFullScreen = windowSerivce.isFullSize();
    this.proofData$ = this.store.pipe(select(selectProofData));

    this.proofData$.subscribe((state) => {
      this.proofData = state;
      this.proofLoaded = true;
    });
  }

  ngOnInit() {
    this.scrollOffset = window.pageYOffset;
    window.scroll(0, 0);
    if (this.isFullScreen) {
      document.body.style.overflowY = 'hidden';
    }
    this.dataService.emitChange({popupOpened: true});
  }

  ngOnDestroy() {
    if (this.sub !== undefined) {
      this.sub.unsubscribe();
    }
    window.scroll(0, this.scrollOffset);
    if (this.isFullScreen) {
      document.body.style.overflowY = 'auto';
    }
    this.dataService.emitChange({popupOpened: false});
  }

  closePopup(event) {
    event.stopPropagation();
    this.router.navigate([{ outlets: { popup: null }}], {relativeTo: this.activatedRoute.parent});
  }

  proofDataToCp() {
    return 'Sender: ' + this.proofData.sender +
    '\nReceiver: ' + this.proofData.receiver +
    '\nAmount: ' + this.proofData.amount / globalConsts.GROTHS_IN_BEAM + ' BEAM' +
    '\nKernel ID: ' + this.proofData.kernelId;
  }

  copyCodeClicked() {
    return this.proofData.code;
  }
}
