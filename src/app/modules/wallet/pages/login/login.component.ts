import { Component, OnInit, OnDestroy } from '@angular/core';
import * as ObservableStore from 'obs-store';
import { webSocket } from 'rxjs/webSocket';
import * as passworder from 'browser-passworder';
import { WasmService } from './../../../../wasm.service';
import {Router} from '@angular/router';
import { WebsocketService } from './../../../websocket';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  constructor(private wasm: WasmService, public router: Router, private wsService: WebsocketService) {
  }

  ngOnInit() {
    const wallet = localStorage.getItem('wallet');
    if (wallet === undefined) {
      this.router.navigate(['/initialize/create']);
    }
  }

  ngOnDestroy() {
  }

  submit() {
    this.router.navigate(['/wallet/main']);
  }
}
