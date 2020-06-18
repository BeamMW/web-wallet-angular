import { Component, OnInit, Input } from '@angular/core';
import * as extensionizer from 'extensionizer';
import { environment } from '@environment';

import { WindowService } from './../../../services';

@Component({
  selector: 'app-header-without-logo',
  templateUrl: './header-without-logo.component.html',
  styleUrls: ['./header-without-logo.component.scss']
})
export class HeaderWithoutLogoComponent implements OnInit {
  public iconFull: string = `${environment.assetsPath}/images/shared/containers/header/icon-full-view.svg`;
  public iconBeta: string = `${environment.assetsPath}/images/shared/containers/header/icon-attention.svg`;
  public isFullScreen = false;

  constructor(private windowService: WindowService) {
    this.isFullScreen = windowService.isFullSize();
  }

  ngOnInit() {
  }

  openFull() {
    const extensionURL = extensionizer.runtime.getURL('index.html#wallet/main');
    extensionizer.tabs.create({ url: extensionURL });
  }
}

