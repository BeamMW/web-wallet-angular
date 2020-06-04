import { Component, OnInit } from '@angular/core';
import { environment } from '@environment';
import { Router } from '@angular/router';
import { DataService } from './../../../../services';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  selectIpSetting,
  selectDnsSetting,
} from '../../../../store/selectors/wallet-state.selectors';

@Component({
  selector: 'app-server',
  templateUrl: './server.component.html',
  styleUrls: ['./server.component.scss']
})
export class ServerComponent implements OnInit {
  public iconBack: string = `${environment.assetsPath}/images/modules/send/containers/send-addresses/icon-back.svg`;
  popupOpened = false;
  dnsSetting$: Observable<any>;
  ipSetting$: Observable<any>;

  constructor(
    private store: Store<any>,
    private dataService: DataService,
    public router: Router) {
    this.dnsSetting$ = this.store.pipe(select(selectDnsSetting));
    this.ipSetting$ = this.store.pipe(select(selectIpSetting));

    dataService.changeEmitted$.subscribe(emittedState => {
      if (emittedState.popupOpened !== undefined) {
        this.popupOpened = emittedState.popupOpened;
      }
    });
  }

  ngOnInit() {
  }

  backClicked(event) {
    event.stopPropagation();
    this.router.navigate(['/settings/all']);
  }

  enterDnsClicked($event) {
    $event.stopPropagation();
    this.router.navigate([this.router.url, { outlets: { popup: 'enter-dns-popup' }}]);
  }

  enterIpClicked($event) {
    $event.stopPropagation();
    this.router.navigate([this.router.url, { outlets: { popup: 'enter-ip-popup' }}]);
  }

}
