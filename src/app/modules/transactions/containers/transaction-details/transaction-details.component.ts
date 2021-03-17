import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { environment } from '@environment';
import { Router } from '@angular/router';
import { selectTrById } from '@app/store/selectors/transaction.selectors';
import {
  selectPrivacySetting
} from '@app/store/selectors/wallet-state.selectors';
import { selectUtxoById } from '@app/store/selectors/utxo.selectors';
import { WasmService, DataService } from '@app/services';
import { saveProofData } from '@app/store/actions/wallet.actions';
import { rpcMethodIdsConsts } from '@consts';

@Component({
  selector: 'app-transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.scss']
})
export class TransactionDetailsComponent implements OnInit {
  privacySetting$: Observable<any>;
  privacyMode = false;
  transaction$: Observable<any>;
  utxoList$: Observable<any>;
  sub: Subscription;
  proofValue = '';
  isUtxoListVisible = true;
  popupOpened = false;

  public iconBack: string = `${environment.assetsPath}/images/modules/send/containers/send-addresses/icon-back.svg`;
  public arrowIcon: string = `${environment.assetsPath}/images/shared/components/table/icon-arrow.svg`;
  public sentIcon: string = `${environment.assetsPath}/images/shared/components/table/icon-sent.svg`;
  public receivedIcon: string = `${environment.assetsPath}/images/shared/components/table/icon-received.svg`;

  constructor(
    private route: ActivatedRoute,
    public store: Store<any>,
    private dataService: DataService,
    private wasmService: WasmService,
    public router: Router) {
      this.privacySetting$ = this.store.pipe(select(selectPrivacySetting));
      this.privacySetting$.subscribe((state) => {
        this.privacyMode = state;
      });

      dataService.changeEmitted$.subscribe(emittedState => {
        this.popupOpened = emittedState.popupOpened;
      });
    }

  ngOnInit() {
    window.scroll(0, 0);
    const txId = this.route.snapshot.params['id'];
    this.transaction$ = this.store.pipe(select(selectTrById(txId)));
    this.transaction$.subscribe((state) => {
      if (state.status_string === 'sent') {
        this.utxoList$ = this.store.pipe(select(selectUtxoById(state.txId)));
        this.loadPaymentProof(state);
      }
    });
  }

  backClicked() {
    this.router.navigate(['/transactions/view']);
  }

  proofDetailsClicked($event) {
    $event.stopPropagation();
    this.router.navigate([this.router.url, { outlets: { popup: 'payment-proof-exported' }}]);
  }

  proofDataToCp() {
    return this.proofValue;
  }

  utxoListHeaderClicked($event) {
    $event.stopPropagation();
    this.isUtxoListVisible = !this.isUtxoListVisible;
  }

  private loadPaymentProof(transaction) {
    this.sub = this.wasmService.wallet.subscribe((r)=> {
      const respone = JSON.parse(r);

      if (respone.id === rpcMethodIdsConsts.EXPORT_PAYMENT_PROOF_ID) {
        if (respone.result && respone.result.payment_proof) {
          this.proofValue = respone.result.payment_proof;
          this.store.dispatch(saveProofData({proofData: {
            sender: transaction.sender,
            receiver: transaction.receiver,
            amount: transaction.value,
            kernelId: transaction.kernel,
            code: respone.result.payment_proof
          }}));
        }
        //this.sub.unsubscribe();
      }
    });

    this.wasmService.wallet.sendRequest(JSON.stringify({
      jsonrpc: '2.0',
      id: rpcMethodIdsConsts.EXPORT_PAYMENT_PROOF_ID,
      method: 'export_payment_proof',
      params: {
        txId: transaction.txId
      }
    }));
  }
}
