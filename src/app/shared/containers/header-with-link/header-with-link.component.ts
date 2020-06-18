import { Component, OnInit, Input } from '@angular/core';
import * as extensionizer from 'extensionizer';
import { environment } from '@environment';

import { WindowService } from './../../../services';

@Component({
  selector: 'app-header-with-link',
  templateUrl: './header-with-link.component.html',
  styleUrls: ['./header-with-link.component.scss']
})
export class HeaderWithLinkComponent implements OnInit {
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
