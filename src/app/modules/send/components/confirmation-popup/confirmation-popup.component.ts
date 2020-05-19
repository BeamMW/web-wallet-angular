
import { Component, OnInit, OnDestroy } from '@angular/core';
import {Router} from '@angular/router';
import { environment } from '@environment';
import { ActivatedRoute} from '@angular/router';
import { DataService, WebsocketService, WindowService } from './../../../../services';
import { Subscription, Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import * as passworder from 'browser-passworder';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import {
  selectWalletData,
  selectSendData,
  selectPasswordCheckSetting,
  selectContact
} from './../../../../store/selectors/wallet-state.selectors';
import { GlobalConsts } from '@consts';

@Component({
  selector: 'app-confirmation-popup',
  templateUrl: './confirmation-popup.component.html',
  styleUrls: ['./confirmation-popup.component.scss']
})
export class ConfirmationPopupComponent implements OnInit, OnDestroy {
  private loadedSendData: any;

  sendData$: Observable<any>;
  wallet$: Observable<any>;
  contact$: Observable<any>;
  passwordCheckSetting$: Observable<any>;
  confirmForm: FormGroup;

  private sub: Subscription;
  private walletSub: Subscription;
  private subscriptions: Subscription[] = [];

  scrollOffset = 0;
  isFullScreen = false;
  isCorrectPass = true;
  isPassCheckEnabled = false;

  public send = {
    address: '',
    fee: 0,
    comment: '',
    amount: 0
  };
  public contactIcon: string = `${environment.assetsPath}/images/shared/components/table/icon-contact.svg`;

  constructor(private store: Store<any>,
              private wsService: WebsocketService,
              public router: Router,
              private activatedRoute: ActivatedRoute,
              private windowService: WindowService,
              private dataService: DataService) {
    this.isFullScreen = windowService.isFullSize();
    this.sendData$ = this.store.pipe(select(selectSendData));
    this.confirmForm = new FormGroup({
      password: new FormControl()
    });
    this.wallet$ = this.store.pipe(select(selectWalletData));
    this.passwordCheckSetting$ = this.store.pipe(select(selectPasswordCheckSetting));

    this.subscriptions.push(this.sendData$.subscribe(sendData => {
      this.contact$ = this.store.pipe(select(selectContact(sendData.address)));
      this.loadedSendData = sendData;
    }));

    this.subscriptions.push(this.passwordCheckSetting$.subscribe(settingValue => {
      this.isPassCheckEnabled = settingValue;
    }));
  }

  ngOnInit() {
    this.dataService.emitChange(true);
    this.send = this.dataService.sendStore.getState().send;
    this.scrollOffset = window.pageYOffset;
    window.scroll(0, 0);
    document.body.style.overflowY = 'hidden';
  }

  ngOnDestroy() {
    this.dataService.emitChange(false);
    if (this.sub !== undefined) {
      this.sub.unsubscribe();
    }

    if (this.walletSub !== undefined) {
      this.walletSub.unsubscribe();
    }
    this.subscriptions.forEach(s => s.unsubscribe());
    window.scroll(0, this.scrollOffset);
    document.body.style.overflowY = 'auto';
  }

  private startSend() {
    this.sub = this.wsService.on().subscribe((msg: any) => {
      if (msg.result) {
        console.log('send result: ', msg);
        if (msg.result !== undefined) {
          this.router.navigate(['/wallet/main']);
        }

        this.sub.unsubscribe();
        this.walletSub.unsubscribe();
      }
    });

    console.log('send init: ', this.loadedSendData);

    this.wsService.send({
      jsonrpc: '2.0',
      id: 123,
      method: 'tx_send',
      params:
      {
        value : this.loadedSendData.amount,
        fee : this.loadedSendData.fee,
        address : this.loadedSendData.address,
        comment : this.loadedSendData.comment &&
          this.loadedSendData.comment.length > 0 ?
          this.loadedSendData.comment : ''
      }
    });
  }

  submit($event) {
    $event.stopPropagation();
    if (this.isPassCheckEnabled) {
      this.walletSub = this.wallet$.subscribe(wallet => {
        passworder.decrypt(this.confirmForm.value.password, wallet).then((result) => {
          this.startSend();
          this.walletSub.unsubscribe();
        }).catch(error => {
          this.isCorrectPass = false;
        });
      });
    } else {
      this.startSend();
    }
  }

  getTotalUtxo() {
    return Math.ceil((this.loadedSendData.amount + this.loadedSendData.fee) / GlobalConsts.GROTHS_IN_BEAM);
  }

  cancelClicked($event) {
    $event.stopPropagation();
    this.closePopup();
  }

  closePopup() {
    this.dataService.emitChange(false);
    this.router.navigate([{ outlets: { popup: null }}], {relativeTo: this.activatedRoute.parent});
  }

  passUpdated($event) {
    this.isCorrectPass = true;
  }
}
