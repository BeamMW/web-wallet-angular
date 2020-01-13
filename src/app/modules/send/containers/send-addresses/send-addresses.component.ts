import { Component, OnInit } from '@angular/core';
import {DataService} from './../../../../services/data.service';
import {Router} from '@angular/router';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import { Subscription } from 'rxjs';
import { WebsocketService } from './../../../websocket';
import { environment } from '@environment';

@Component({
  selector: 'app-send-addresses',
  templateUrl: './send-addresses.component.html',
  styleUrls: ['./send-addresses.component.scss']
})
export class SendAddressesComponent implements OnInit {
  public iconBack: string = `${environment.assetsPath}/images/modules/send/containers/send-addresses/icon-back.svg`;
  send = {
    address: ''
  };
  sendForm: FormGroup;
  constructor(private dataService: DataService, public router: Router, private wsService: WebsocketService) {
    this.send = this.dataService.sendStore.getState().send;
    let address = '';
    if (this.send !== undefined && this.send.address !== undefined) {
      address = this.send.address;
    }

    this.sendForm = new FormGroup({
      address: new FormControl(address)
    });
  }

  submit() {
    this.dataService.sendStore.putState({send: {
      address: this.sendForm.value.address
    }});
    this.router.navigate(['/send/amount']);
  }

  ngOnInit() {
  }

  backConfirmationClicked() {
    this.router.navigate(['/wallet/main']);
  }
}
