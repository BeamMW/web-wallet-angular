import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from '@environment';
import { Router } from '@angular/router';
import { WebsocketService } from './../../../websocket';
import { Subscription } from 'rxjs';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import { DataService, WindowService } from './../../../../services';
import { Store, select } from '@ngrx/store';
import { saveReceiveData } from './../../../../store/actions/wallet.actions';


@Component({
  selector: 'app-receive',
  templateUrl: './receive.component.html',
  styleUrls: ['./receive.component.scss']
})
export class ReceiveComponent implements OnInit, OnDestroy {
  public iconBack = `${environment.assetsPath}/images/modules/send/containers/send-addresses/icon-back.svg`;
  public generatedAddress = '';

  private sub: Subscription;
  receiveForm: FormGroup;
  popupOpened = false;
  isFullScreen = false;

  constructor(private store: Store<any>,
              public router: Router,
              private dataService: DataService,
              private windowService: WindowService,
              private wsService: WebsocketService) {
    this.isFullScreen = windowService.isFullSize();
    this.receiveForm = new FormGroup({
      amount: new FormControl(),
      comment: new FormControl()
    });

    dataService.changeEmitted$.subscribe(emittedState => {
      this.popupOpened = emittedState;
    });
  }

  ngOnInit() {
    this.createAddress();
  }

  ngOnDestroy() {
    if (this.sub !== undefined) {
      this.sub.unsubscribe();
    }
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

  stripText(control: FormControl) {
    control.setValue(control.value.replace(/[^0-9]/g, ''));
  }

  editAddress() {
    this.sub = this.wsService.on().subscribe((msg: any) => {
      if (msg.result) {
        console.log(msg.result);
        this.sub.unsubscribe();
      }
    });
    this.wsService.send({
        jsonrpc: '2.0',
        id: 123,
        method: 'edit_address',
        params:
        {
            address : '19ecec1a5793060fd9e49ee67560da4a4cf7ad8a42577019a9fa0f95fe6e550e81e',
            comment : '',
            expiration: 'never'
        }
    });
  }

  qrShowClicked(event) {
    event.stopPropagation();
    this.router.navigate([this.router.url, { outlets: { popup: 'qr-popup' }}]);
    this.submit();
  }

  submit() {
    this.store.dispatch(saveReceiveData({receive: {
      address: this.generatedAddress,
      amount: this.receiveForm.value.amount,
      comment: this.receiveForm.value.comment
    }}));
  }
}
