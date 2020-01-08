import { Component, OnInit } from '@angular/core';
import * as extensionizer from 'extensionizer';
import { environment } from '@environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  public iconFull: string = `${environment.assetsPath}/images/shared/containers/header/icon-full-view.svg`;
  constructor() { }

  ngOnInit() {
  }

  openFull() {
    const extensionURL = extensionizer.runtime.getURL('index.html#wallet/main');
    extensionizer.tabs.create({ url: extensionURL });
  }
}
