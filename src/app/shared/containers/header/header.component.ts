import { Component, OnInit } from '@angular/core';
import { environment } from '@environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  constructor() { }

  public iconBeta: string = `${environment.assetsPath}/images/shared/containers/header/icon-attention.svg`;

  ngOnInit() {
  }
}
