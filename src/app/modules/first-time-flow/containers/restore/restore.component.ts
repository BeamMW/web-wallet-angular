import { Component, OnInit } from '@angular/core';
import { environment } from '@environment';
import { Router, NavigationExtras } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { selectWasmState } from '../../../../store/selectors/wallet-state.selectors';
import { Observable, Subscription, from } from 'rxjs';
import { WindowService } from '../../../../services';
import { routes } from '@consts';
import { WasmService } from '../../../../wasm.service';

import * as passworder from 'browser-passworder';
import { DataService, LoginService, WebsocketService } from './../../../../services';
import { ChangeWalletState } from './../../../../store/actions/wallet.actions';


@Component({
  selector: 'app-restore',
  templateUrl: './restore.component.html',
  styleUrls: ['./restore.component.scss']
})

export class RestoreComponent implements OnInit {
  public iconBack: string = `${environment.assetsPath}/images/modules/send/containers/send-addresses/icon-back.svg`;
  public routesConsts = routes;

  public isFullScreen = false;
  private WORDS_TO_CONFIRM_COUNT = 12;

  private seedState = [];
  private seedConfirmed = false;
  private sub: Subscription;

  constructor(
      private store: Store<any>,
      private windowService: WindowService,
      private wasmService: WasmService,
      private websocketService: WebsocketService,
      private loginService: LoginService,
      private dataService: DataService,
      public router: Router) {
    this.isFullScreen = this.windowService.isFullSize();
    this.seedState = Array.from(Array(this.WORDS_TO_CONFIRM_COUNT)).map((elem, i)=> {
      return {
        allowed: false,
        inProgress: false,
        value: '',
        index: i + 1
      }
    });
  }
  ngOnInit() {
  }

  wordInputUpdated($event, item) {
    const valueFromInput = $event.target.value;
    const isAllowed = this.wasmService.isAllowedWord(valueFromInput);
    if (valueFromInput === null || valueFromInput.length === 0) {
      item.allowed = false;
      item.inProgress = false;
    } else if (valueFromInput !== null && isAllowed) {
      item.allowed = true;
      item.inProgress = false;
    } else if (valueFromInput !== null && !isAllowed) {
      item.allowed = false;
      item.inProgress = true;
    }
    item.value = valueFromInput;
    this.checkConfirmationState();
  }

  checkConfirmationState() {
    let counter = 0;
    this.seedState.forEach(item => {
      if (item.allowed) {
        counter++;
      }
    });

    this.seedConfirmed = counter === this.WORDS_TO_CONFIRM_COUNT;
  }

  backClicked(event) {
    event.stopPropagation();
    //TODO OR TO LOGIN
    this.router.navigate([routes.FTF_CREATE_WALLET_ROUTE]);
  }

  nextClicked() {
    //if (this.seedConfirmed) {
    //   const navigationExtras: NavigationExtras = {
    //     state: {
    //       seedConfirmed: false,
    //       seed: this.seedState.join(' ')
    //     }
    //   };
    //   this.router.navigate([routes.FTF_PASSWORD_CREATE_ROUTE], navigationExtras);
    //}
  }

  restore(seed) {
    this.wasmService.keykeeperInit(seed).subscribe(value => {
      const ownerKey = this.wasmService.keyKeeper.getOwnerKey('123');
      console.log('[create-wallet] ownerKey is: data:application/octet-stream;base64,' + ownerKey);

      this.sub = this.websocketService.on().subscribe((msg: any) => {
        console.log('[create-wallet] got response: ');
        console.dir(msg);
        if (msg.result && msg.result.length) {
          console.log(`[create-wallet] wallet session: ${msg.result}`);

          passworder.encrypt('123', {seed: seed, id: msg.result})
            .then((result) => {
              this.dataService.saveWallet(result);
              this.dataService.settingsInit(this.seedConfirmed);
              this.sub.unsubscribe();
              this.dataService.loginToWallet(msg.result, '123');
            });
        }
      });

      this.websocketService.send({
        jsonrpc: '2.0',
        id: 0,
        method: 'create_wallet',
        params: {
          pass: '123',
          ownerkey: ownerKey
        }
    });
    });
  }
}
