import { Component, OnInit } from '@angular/core';
import { selectAddress } from '../../../../store/selectors/address.selectors';
import { Observable } from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import { Store, select } from '@ngrx/store';
import { environment } from '@environment';
import { Router } from '@angular/router';
import { selectTrByAddress } from '../../../../store/selectors/transaction.selectors';

@Component({
  selector: 'app-address-details',
  templateUrl: './address-details.component.html',
  styleUrls: ['./address-details.component.scss']
})
export class AddressDetailsComponent implements OnInit {
  address$: Observable<any>;
  transactions$: Observable<any>;
  public iconBack: string = `${environment.assetsPath}/images/modules/send/containers/send-addresses/icon-back.svg`;
  public iconReceived: string = `${environment.assetsPath}/images/modules/wallet/containers/main/icon-received.svg`;
  public iconSent: string = `${environment.assetsPath}/images/modules/wallet/containers/main/icon-sent.svg`;

  constructor(
    private route: ActivatedRoute,
    public store: Store<any>,
    public router: Router) { }

  ngOnInit() {
    const address = this.route.snapshot.params['address'];
    this.address$ = this.store.pipe(select(selectAddress(address)));
    this.transactions$ = this.store.pipe(select(selectTrByAddress(address)));
  }

  backClicked() {
    this.router.navigate(['/addresses/list']);
  }

}
