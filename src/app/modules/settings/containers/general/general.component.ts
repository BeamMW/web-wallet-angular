import { Component, OnInit } from '@angular/core';
import { environment } from '@environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss']
})
export class GeneralComponent implements OnInit {
  public iconBack: string = `${environment.assetsPath}/images/modules/send/containers/send-addresses/icon-back.svg`;

  public logsMenuItems = [{
    title: 'For all time', id: 2, selected: true
  }, {
    title: 'Last 5 days', id: 0, selected: false
  }, {
    title: 'Last 30 days', id: 1, selected: false
  }];

  public currencyMenuItems = [{
    title: 'USD (United State Dollar)', id: 0, selected: true
  }, {
    title: 'BTC (Bitcoin)', id: 1, selected: false
  }, {
    title: 'LTC (Litecoin)', id: 2, selected: false
  }, {
    title: 'QTUM', id: 3, selected: false
  }];

  constructor(public router: Router) { }

  ngOnInit() {
  }

  backClicked(event) {
    event.stopPropagation();
    this.router.navigate(['/settings/all']);
  }

  logsDropdownSelected(item) {
    if (item === this.logsDropdownSelected[0]) {

    } else if (item === this.logsDropdownSelected[1]) {

    } else if (item === this.logsDropdownSelected[2]) {

    }
  }
}
