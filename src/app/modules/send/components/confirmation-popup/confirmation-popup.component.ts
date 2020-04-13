
import { Component, OnInit, OnDestroy } from '@angular/core';
import {Router} from '@angular/router';
import { environment } from '@environment';
import { ActivatedRoute} from '@angular/router';
import { DataService, WebsocketService } from './../../../../services';
import { Subscription, Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import * as passworder from 'browser-passworder';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import { selectWalletData, selectSendData } from './../../../../store/selectors/wallet-state.selectors';

@Component({
  selector: 'app-confirmation-popup',
  templateUrl: './confirmation-popup.component.html',
  styleUrls: ['./confirmation-popup.component.scss']
})
export class ConfirmationPopupComponent implements OnInit, OnDestroy {
  sendData$: Observable<any>;
  wallet$: Observable<any>;
  confirmForm: FormGroup;
  sub: Subscription;
  walletSub: Subscription;
  public send = {
    address: '',
    fee: 0,
    comment: '',
    amount: 0
  };

  constructor(private store: Store<any>,
              private wsService: WebsocketService,
              public router: Router,
              private activatedRoute: ActivatedRoute,
              private dataService: DataService) {
    this.sendData$ = this.store.pipe(select(selectSendData));
    this.confirmForm = new FormGroup({
      password: new FormControl()
    });
    this.wallet$ = this.store.pipe(select(selectWalletData));
  }

  ngOnInit() {
    this.dataService.emitChange(true);
    this.send = this.dataService.sendStore.getState().send;
  }

  ngOnDestroy() {
    this.dataService.emitChange(false);
    if (this.sub !== undefined) {
      this.sub.unsubscribe();
    }

    if (this.walletSub !== undefined) {
      this.walletSub.unsubscribe();
    }
  }

  submit($event) {
    $event.stopPropagation();
    this.walletSub = this.wallet$.subscribe(wallet => {
      passworder.decrypt(this.confirmForm.value.password, wallet).then((result) => {
        this.sendData$.subscribe(sendData => {
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

          console.log('send init: ', sendData);

          this.wsService.send({
            jsonrpc: '2.0',
            id: 123,
            method: 'tx_send',
            params:
            {
              value : sendData.amount,
              fee : sendData.fee,
              address : sendData.address,
              comment : sendData.comment && sendData.comment.length > 0 ? sendData.comment : ''
            }
          });
        });
      });
    });
  }

  cancelClicked($event) {
    $event.stopPropagation();
    this.closePopup();
  }

  closePopup() {
    this.router.navigate([{ outlets: { popup: null }}], {relativeTo: this.activatedRoute.parent});
  }
}
