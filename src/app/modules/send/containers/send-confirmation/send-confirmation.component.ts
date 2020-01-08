import { Component, OnInit } from '@angular/core';
import {DataService} from './../../../../services/data.service';
import {Router} from '@angular/router';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import { Subscription } from 'rxjs';
import { WebsocketService } from './../../../websocket';
import { environment } from '@environment';

@Component({
  selector: 'app-send-confirmation',
  templateUrl: './send-confirmation.component.html',
  styleUrls: ['./send-confirmation.component.scss']
})
export class SendConfirmationComponent implements OnInit {
  public iconBack: string = `${environment.assetsPath}/images/modules/send/containers/send-addresses/icon-back.svg`;
  active = false;
  sendForm: FormGroup;
  sub: Subscription;
  public send = {
    address: '',
    fee: 0,
    comment: '',
    amount: 0
  };
  public walletRoute = '/wallet/main';
  constructor(private dataService: DataService, public router: Router, private wsService: WebsocketService) { 
  }

  submit() {
    this.sub = this.wsService.on().subscribe((msg: any) => {
      if (msg.result) {
        if (msg.result !== undefined) {
          this.router.navigate(['/wallet/main']);
        }

        this.sub.unsubscribe();
      }
    });
    this.wsService.send({jsonrpc:"2.0", 
      id: 123,
      method:"tx_send", 
      params:
      {
        value : this.send.amount * 100000000,
        fee : this.send.fee,
        address : this.send.address,
        comment : this.send.comment
      }
    });
  }

  ngOnInit() {
    this.active = this.dataService.store.getState().active;
    this.send = this.dataService.sendStore.getState().send;

    if (!this.active){
      this.router.navigate(['/wallet/login']);
    }
  }

  backAmountClicked() {
    this.router.navigate(['/send/amount']);
  }
}
