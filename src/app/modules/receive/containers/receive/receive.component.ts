import { Component, OnInit } from '@angular/core';
import { environment } from '@environment';
import { Router } from '@angular/router';
import { WebsocketService } from './../../../websocket';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-receive',
  templateUrl: './receive.component.html',
  styleUrls: ['./receive.component.scss']
})
export class ReceiveComponent implements OnInit {
  public iconBack: string = `${environment.assetsPath}/images/modules/send/containers/send-addresses/icon-back.svg`;
  public generatedAddress: string = '';

  private sub: Subscription;

  constructor(
    public router: Router,
    private wsService: WebsocketService) { }

  ngOnInit() {
    this.createAddress();
  }

  backClicked(event) {
    event.stopPropagation();
    this.router.navigate(['/wallet/main']);
  }

  createAddress() {
    this.sub = this.wsService.on().subscribe((msg: any) => {
      if (msg.result) {
        this.generatedAddress = msg.result;
        this.sub.unsubscribe();
      }
    });
    this.wsService.send({
        jsonrpc: '2.0',
        id: 123,
        method: 'create_address',
        params:
        {
            expiration : '24h',
            comment : ''
        }
    });
  }
}
