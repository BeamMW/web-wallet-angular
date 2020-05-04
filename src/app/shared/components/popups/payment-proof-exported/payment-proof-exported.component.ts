import { Component, OnInit, OnDestroy } from '@angular/core';
import {Router} from '@angular/router';
import { ActivatedRoute} from '@angular/router';
import { DataService, WindowService, WebsocketService } from './../../../../services';
import { Subscription, Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { selectProofData } from '../../../../store/selectors/wallet-state.selectors';

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
  popupOpened = false;
  scrollOffset = 0;
  proofData$: Observable<any>;

  constructor(private websocketService: WebsocketService,
              private windowSerivce: WindowService,
              private router: Router,
              private store: Store<any>,
              private activatedRoute: ActivatedRoute,
              private dataService: DataService) {
    this.isFullScreen = windowSerivce.isFullSize();

    dataService.changeEmitted$.subscribe(emittedState => {
      if (emittedState.popupOpened !== undefined) {
        this.popupOpened = emittedState.popupOpened;
      }
    });

    this.proofData$ = this.store.pipe(select(selectProofData));

    this.proofData$.subscribe((state) => {
      this.proofData = state;
      this.proofLoaded = true;
    });
  }

  ngOnInit() {
    this.dataService.emitChange({popupOpened: true});
    this.scrollOffset = window.pageYOffset;
    window.scroll(0, 0);
    document.body.style.overflowY = 'hidden';
  }

  ngOnDestroy() {
    this.dataService.emitChange({popupOpened: false});
    if (this.sub !== undefined) {
      this.sub.unsubscribe();
    }
    window.scroll(0, this.scrollOffset);
    document.body.style.overflowY = 'auto';
  }

  closePopup(event) {
    event.stopPropagation();
    this.router.navigate([{ outlets: { popup: null }}], {relativeTo: this.activatedRoute.parent});
  }

  proofDataToCp() {
    return 'Sender: ' + this.proofData.sender +
    '\nReceiver: ' + this.proofData.receiver +
    '\nAmount: ' + this.proofData.amount / 100000000 + ' BEAM' +
    '\nKernel ID: ' + this.proofData.kernelId;
  }

  copyCodeClicked() {
    return this.proofData.code;
  }
}
