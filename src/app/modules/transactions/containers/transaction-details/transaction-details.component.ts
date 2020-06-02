import { Component, OnInit } from '@angular/core';
import { selectAddress } from '../../../../store/selectors/address.selectors';
import { Observable } from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import { Store, select } from '@ngrx/store';
import { environment } from '@environment';
import {Router} from '@angular/router';
import { selectTrById } from '../../../../store/selectors/transaction.selectors';
import {
  selectPrivacySetting
} from '../../../../store/selectors/wallet-state.selectors';

@Component({
  selector: 'app-transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.scss']
})
export class TransactionDetailsComponent implements OnInit {
  privacySetting$: Observable<any>;
  privacyMode = false;
  transaction$: Observable<any>;
  public iconBack: string = `${environment.assetsPath}/images/modules/send/containers/send-addresses/icon-back.svg`;

  constructor(
    private route: ActivatedRoute,
    public store: Store<any>,
    public router: Router) {
      this.privacySetting$ = this.store.pipe(select(selectPrivacySetting));
      this.privacySetting$.subscribe((state) => {
        this.privacyMode = state;
      });
    }

  ngOnInit() {
    window.scroll(0, 0);
    const txId = this.route.snapshot.params['id'];
    this.transaction$ = this.store.pipe(select(selectTrById(txId)));
  }

  backClicked() {
    this.router.navigate(['/transactions/view']);
  }

}
