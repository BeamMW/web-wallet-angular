import { Component, OnInit, OnDestroy } from '@angular/core';
import {DataService} from './../../../../services/data.service';
import {Router} from '@angular/router';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import { Observable } from 'rxjs';
import { WebsocketService } from './../../../websocket';
import { environment } from '@environment';
import { Store, select } from '@ngrx/store';
import { selectWalletStatus } from '../../../../store/selectors/wallet-state.selectors';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-send-amount',
  templateUrl: './send-amount.component.html',
  styleUrls: ['./send-amount.component.scss']
})
export class SendAmountComponent implements OnInit, OnDestroy {
  public iconBack: string = `${environment.assetsPath}/images/modules/send/containers/send-addresses/icon-back.svg`;
  send = {
    address: '',
    fee: 0,
    comment: '',
    amount: 0
  };
  walletStatus$: Observable<any>;
  sendForm: FormGroup;
  walletStatusSub: Subscription;

  constructor(private dataService: DataService,
              public router: Router,
              private store: Store<any>,
              private wsService: WebsocketService) {
    this.walletStatus$ = this.store.pipe(select(selectWalletStatus));
    this.send = this.dataService.sendStore.getState().send;
    let amount = 0;
    let fee = 100;
    let comment = '';

    if (this.send !== undefined) {
      amount = this.send.amount;
      fee = this.send.fee === undefined || this.send.fee === 0 ? 100 : this.send.fee;
      comment = this.send.comment;
    }

    this.sendForm = new FormGroup({
      fee: new FormControl(fee, [
        Validators.required
      ]),
      comment: new FormControl(comment),
      amount: new FormControl(amount, [
        Validators.required
      ])
    });
  }

  submit() {
    this.send.fee = parseInt(this.sendForm.value.fee, 10);
    this.send.comment = this.sendForm.value.comment;
    this.send.amount = parseFloat(this.sendForm.value.amount);
    this.dataService.sendStore.putState({send: this.send});
    this.router.navigate(['/send/confirmation']);
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this.walletStatusSub) {
      this.walletStatusSub.unsubscribe();
    }
  }

  stripText(control: FormControl) {
    control.setValue(control.value.replace(/[^0-9]/g, ''));
  }

  backAddressesClicked() {
    this.router.navigate(['/send/addresses']);
  }

  addAll($event) {
    $event.preventDefault();
    this.walletStatusSub = this.walletStatus$.subscribe((status) => {
      if (status.available > 0) {
        this.sendForm.get('amount').setValue((status.available - this.sendForm.value.fee) / 100000000);
      }
    });
  }
}
