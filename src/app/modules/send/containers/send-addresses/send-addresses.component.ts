import { Component, OnInit, OnDestroy } from '@angular/core';
import {Router} from '@angular/router';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { WebsocketService } from './../../../websocket';
import { environment } from '@environment';
import { DataService, WindowService } from './../../../../services';
import { Store, select } from '@ngrx/store';
import { selectWalletStatus } from '../../../../store/selectors/wallet-state.selectors';

@Component({
  selector: 'app-send-addresses',
  templateUrl: './send-addresses.component.html',
  styleUrls: ['./send-addresses.component.scss']
})
export class SendAddressesComponent implements OnInit, OnDestroy {
  public iconBack: string = `${environment.assetsPath}/images/modules/send/containers/send-addresses/icon-back.svg`;
  send = {
    address: ''
  };
  sendForm: FormGroup;
  fullSendForm: FormGroup;
  isFullScreen = false;
  walletStatus$: Observable<any>;
  walletStatusSub: Subscription;
  popupOpened = false;

  constructor(private dataService: DataService,
              public router: Router,
              private store: Store<any>,
              private windowService: WindowService,
              private wsService: WebsocketService) {
    this.walletStatus$ = this.store.pipe(select(selectWalletStatus));
    this.isFullScreen = windowService.isFullSize();
    this.send = this.dataService.sendStore.getState().send;
    let address = '';
    if (this.send !== undefined && this.send.address !== undefined) {
      address = this.send.address;
    }

    this.sendForm = new FormGroup({
      address: new FormControl(address,  [
        Validators.required
      ])
    });

    this.fullSendForm = new FormGroup({
      address: new FormControl('',  [
        Validators.required
      ]),
      fee: new FormControl(100, [
        Validators.required
      ]),
      comment: new FormControl(''),
      amount: new FormControl(0, [
        Validators.required
      ])
    });

    dataService.changeEmitted$.subscribe(emittedState => {
      this.popupOpened = emittedState;
    });
  }

  submit() {
    this.dataService.sendStore.putState({send: {
      address: this.sendForm.value.address
    }});
    this.router.navigate(['/send/amount']);
  }

  fullSubmit() {
    this.dataService.sendStore.putState({send: {
      address: this.sendForm.value.address
    }});
    this.router.navigate([this.router.url, { outlets: { popup: 'confirm-popup' }}]);
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this.walletStatusSub) {
      this.walletStatusSub.unsubscribe();
    }
  }

  backConfirmationClicked() {
    this.router.navigate(['/wallet/main']);
  }

  addAll($event) {
    $event.preventDefault();
    this.walletStatusSub = this.walletStatus$.subscribe((status) => {
      if (status.available > 0) {
        this.isFullScreen ?
          this.fullSendForm.get('amount').setValue((status.available - this.fullSendForm.value.fee) / 100000000) :
          this.sendForm.get('amount').setValue((status.available - this.sendForm.value.fee) / 100000000);
      }
    });
  }
}
