import { Component, OnInit } from '@angular/core';
import {DataService} from './../../../../services/data.service';
import {Router} from '@angular/router';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import { Subscription } from 'rxjs';
import { WebsocketService } from './../../../websocket';

@Component({
  selector: 'app-send-confirmation',
  templateUrl: './send-confirmation.component.html',
  styleUrls: ['./send-confirmation.component.scss']
})
export class SendConfirmationComponent implements OnInit {
  active = false;
  sendForm: FormGroup;
  sub: Subscription;
  public walletRoute = '/wallet/main';
  constructor(private dataService: DataService, public router: Router, private wsService: WebsocketService) { 
    this.sendForm = new FormGroup({
      address: new FormControl(),
      amount: new FormControl()
    });
  }

  submit() {
    this.sub = this.wsService.on().subscribe((msg: any) => {
      if (msg.result) {
        if (msg.result !== undefined) {
          alert('sended');
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
        value : parseInt(this.sendForm.value.amount, 10),
        fee : 100,
        address : this.sendForm.value.address,
        comment : ''
      }
    });
  }

  ngOnInit() {
    this.active = this.dataService.store.getState().active;

    if (!this.active){
      this.router.navigate(['/wallet/login']);
    }
  }

}
