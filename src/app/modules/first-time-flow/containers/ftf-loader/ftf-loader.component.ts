import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '@environment';
import { WindowService, DataService, LoginService, WebsocketService } from '../../../../services';
import { routes } from '@consts';
import { popupRoutes } from '@consts';
import { WasmService } from '../../../../wasm.service';
import * as passworder from 'browser-passworder';

@Component({
  selector: 'app-ftf-loader',
  templateUrl: './ftf-loader.component.html',
  styleUrls: ['./ftf-loader.component.scss']
})
export class FtfLoaderComponent implements OnInit {
  public bgUrl: string;
  public logoUrl: string = `${environment.assetsPath}/images/modules/wallet/containers/login/logo.svg`;
  public isFullScreen = false;
  public popupOpened = false;
  private keeperSub: Subscription;
  private sub: Subscription;

  private componentSettings = {
    pass: '',
    seed: '',
    seedConfirmed: false
  };

  constructor(public router: Router,
              private wasmService: WasmService,
              private dataService: DataService,
              private websocketService: WebsocketService,
              private windowService: WindowService) {
    this.isFullScreen = windowService.isFullSize();
    this.bgUrl = `${environment.assetsPath}/images/modules/wallet/containers/login/` +
      (this.isFullScreen ? 'bg-full.svg' : 'bg.svg');

    try {
      const navigation = this.router.getCurrentNavigation();
      const state = navigation.extras.state as {seed: string, pass: string, seedConfirmed: boolean};

      this.componentSettings.pass = state.pass;
      this.componentSettings.seed = state.seed;
      this.componentSettings.seedConfirmed = state.seedConfirmed;

    } catch (e) {
    }
  }

  ngOnInit() {
    console.log(`[create-wallet] Creating new wallet with seed phrase: ${this.componentSettings.seed}`);
    this.keeperSub = this.wasmService.keykeeperInit(this.componentSettings.seed).subscribe(value => {
      const ownerKey = this.wasmService.keyKeeper.getOwnerKey(this.componentSettings.pass);
      console.log('[create-wallet] ownerKey is: data:application/octet-stream;base64,' + ownerKey);

      this.sub = this.websocketService.on().subscribe((msg: any) => {
        console.log('[create-wallet] got response: ');
        console.dir(msg);
        if (msg.result && msg.result.length) {
          console.log(`[create-wallet] wallet session: ${msg.result}`);

          passworder.encrypt(this.componentSettings.pass, {
              seed: this.componentSettings.seed,
              id: msg.result
            })
            .then((result) => {
              this.dataService.saveWallet(result);
              this.dataService.settingsInit(this.componentSettings.seedConfirmed);
              this.sub.unsubscribe();
              this.keeperSub.unsubscribe();
              this.dataService.loginToWallet(msg.result, this.componentSettings.pass);
            });
        }
      });

      this.websocketService.send({
        jsonrpc: '2.0',
        id: 0,
        method: 'create_wallet',
        params: {
          pass: this.componentSettings.pass,
          ownerkey: ownerKey
        }
      });
    });
  }

  ngOnDestroy() {
  }
}
