import { Component } from '@angular/core';
import { environment } from '@environment';

@Component({
  selector: 'app-header-logo',
  templateUrl: './header-logo.component.html',
  styleUrls: ['./header-logo.component.scss']
})
export class HeaderLogoComponent  {
  public mainRouterLink = '/wallet/main';
  public logoImageUrl: string = `${environment.assetsPath}/images/shared/components/header-logo/logo.svg`;
}
