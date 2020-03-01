import { Component, OnInit, OnDestroy } from '@angular/core';
import { webSocket } from 'rxjs/webSocket';
import {Router} from '@angular/router';
import * as ObservableStore from 'obs-store';
import { Subscription } from 'rxjs';
import { environment } from '@environment';
import { WindowService, WebsocketService } from '../../../../services';

@Component({
  selector: 'app-ftf-create',
  templateUrl: './ftf-create.component.html',
  styleUrls: ['./ftf-create.component.scss']
})
export class FtfCreateComponent implements OnInit, OnDestroy {
  public bgUrl: string = `${environment.assetsPath}/images/modules/wallet/containers/login/bg.svg`;
  public logoUrl: string = `${environment.assetsPath}/images/modules/wallet/containers/login/logo.svg`;
  public isFullScreen = false;

  generateSeedRoute = '/initialize/generate-seed';

  sub: Subscription;

  constructor(public router: Router,
              private windowService: WindowService,
              private wasmService: WebsocketService) { 
    this.isFullScreen = windowService.isFullSize();
    this.bgUrl = `${environment.assetsPath}/images/modules/wallet/containers/login/` +
      (this.isFullScreen ? 'bg-full.svg' : 'bg.svg');
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this.sub !== undefined) {
      this.sub.unsubscribe();
    }
  }
}
