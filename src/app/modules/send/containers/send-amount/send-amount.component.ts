import { Component, OnInit } from '@angular/core';
import {DataService} from './../../../../services/data.service';
import {Router} from '@angular/router';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import { Subscription } from 'rxjs';
import { WebsocketService } from './../../../websocket';
import { environment } from '@environment';

@Component({
  selector: 'app-send-amount',
  templateUrl: './send-amount.component.html',
  styleUrls: ['./send-amount.component.scss']
})
export class SendAmountComponent implements OnInit {
  public iconBack: string = `${environment.assetsPath}/images/modules/send/containers/send-addresses/icon-back.svg`;
  active = false;
  send = {
    address: '',
    fee: 0,
    comment: '',
    amount: 0
  };
  sendForm: FormGroup;
  constructor(private dataService: DataService, public router: Router, private wsService: WebsocketService) { 
    this.send = this.dataService.sendStore.getState().send;
    let amount = 0;
    let fee = 0;
    let comment = '';

    if (this.send !== undefined) {
      amount = this.send.amount;
      fee = this.send.fee;
      comment = this.send.comment;
    }

    this.sendForm = new FormGroup({
      fee: new FormControl(fee),
      comment: new FormControl(comment),
      amount: new FormControl(amount)
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
    this.active = this.dataService.store.getState().active;

    if (!this.active) {
      this.router.navigate(['/wallet/login']);
    }
  }

  backAddressesClicked() {
    this.router.navigate(['/send/addresses']);
  }
}
