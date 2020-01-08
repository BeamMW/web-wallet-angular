import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from '@environment';

@Component({
  selector: 'app-address-element',
  templateUrl: './address-element.component.html',
  styleUrls: ['./address-element.component.scss']
})
export class AddressElementComponent implements OnInit {
  public addressIcon: string;

  @Input() item;
  //@Output() userNameChange = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
    this.addressIcon = this.item.duration === 0 ?
      `${environment.assetsPath}/images/modules/addresses/components/address-element/icon-infinity.svg` :
      `${environment.assetsPath}/images/modules/addresses/components/address-element/icon-expired.svg`;
  }

}
