import { Component, OnInit } from '@angular/core';
import { environment } from '@environment';
import { Router } from '@angular/router';
import { WindowService } from '../../../../services';
import { routes } from '@consts';

@Component({
  selector: 'app-ftf-generate-seed',
  templateUrl: './ftf-generate-seed.component.html',
  styleUrls: ['./ftf-generate-seed.component.scss']
})
export class FtfGenerateSeedComponent implements OnInit {
  public iconBack: string = `${environment.assetsPath}/images/modules/send/containers/send-addresses/icon-back.svg`;

  public iconCopy: string =
    `${environment.assetsPath}/images/modules/first-time-flow/containers/ftf-generate-seed/copy-two-paper-sheets-interface-symbol.svg`;
  public iconPass: string = `${environment.assetsPath}/images/modules/first-time-flow/containers/ftf-generate-seed/password.svg`;
  public iconEye: string = `${environment.assetsPath}/images/modules/first-time-flow/containers/ftf-generate-seed/eye.svg`;

  routesConsts = routes;
  isFullScreen = false;

  constructor(public router: Router,
              private windowService: WindowService) {
    this.isFullScreen = this.windowService.isFullSize();
  }

  ngOnInit() {
  }

  backClicked(event) {
    event.stopPropagation();
    this.router.navigate([routes.FTF_CREATE_WALLET_ROUTE]);
  }

}
