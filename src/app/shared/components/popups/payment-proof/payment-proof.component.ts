import { Component, OnInit, OnDestroy } from '@angular/core';
import {Router} from '@angular/router';
import { ActivatedRoute} from '@angular/router';
import { DataService, WindowService } from '@app/services';
import { Subscription, Observable } from 'rxjs';
import { FormGroup, FormControl} from '@angular/forms';
import { environment } from '@environment';
import { WasmService } from '../../../../services/wasm.service';
import { rpcMethodIdsConsts, globalConsts } from '@consts';

@Component({
  selector: 'app-payment-proof',
  templateUrl: './payment-proof.component.html',
  styleUrls: ['./payment-proof.component.scss']
})
export class PaymentProofComponent implements OnInit, OnDestroy {
  wallet$: Observable<any>;
  sub: Subscription;
  isFullScreen = false;
  proofLoaded = false;
  parseError = false;
  proofForm: FormGroup;
  proofData: any;
  popupOpened = false;

  popupCloseIcon: string = `${environment.assetsPath}/images/shared/components/popups/payment-proof/ic-cancel-popup.svg`;

  constructor(private windowSerivce: WindowService,
              private wasmService: WasmService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private dataService: DataService) {
    this.isFullScreen = windowSerivce.isFullSize();

    this.proofForm = new FormGroup({
      proof: new FormControl()
    });

    dataService.changeEmitted$.subscribe(emittedState => {
      if (emittedState.popupOpened !== undefined) {
        this.popupOpened = emittedState.popupOpened;
      }
    });
  }

  ngOnInit() {
    this.dataService.emitChange({popupOpened: true});
    if (this.isFullScreen) {
      window.scroll(0, 0);
      document.body.style.overflowY = 'hidden';
    }
  }

  ngOnDestroy() {
    this.dataService.emitChange({popupOpened: false});
    if (this.sub !== undefined) {
      this.sub.unsubscribe();
    }
    if (this.isFullScreen) {
      document.body.style.overflowY = 'auto';
    }
  }

  submit($event) {
    $event.stopPropagation();
  }

  closePopup(event) {
    event.stopPropagation();
    this.router.navigate([{ outlets: { popup: null }}], {relativeTo: this.activatedRoute.parent});
  }

  proofInputUpdated(control: FormControl) {
    this.verifyPaymentProof(control.value);
  }

  private verifyPaymentProof(proofValue) {
    this.sub = this.wasmService.wallet.subscribe((r)=> {
      const respone = JSON.parse(r);

      if (respone.id === rpcMethodIdsConsts.VERIFY_PAYMENT_PROOF_ID) {
        if (respone.result && respone.result.is_valid && proofValue.length > 0) {
          this.proofData = respone.result;
          this.proofLoaded = true;
          this.parseError = false;
        } else if (respone.error && proofValue.length === 0) {
          this.proofLoaded = false;
          this.parseError = false;
        } else {
          this.proofLoaded = false;
          this.parseError = true; 
        }
        //this.sub.unsubscribe();
      }
    });

    this.wasmService.wallet.sendRequest(JSON.stringify({
      jsonrpc: '2.0',
      id: rpcMethodIdsConsts.VERIFY_PAYMENT_PROOF_ID,
      method: 'verify_payment_proof',
      params: {
        payment_proof: proofValue
      }
    }));
  }

  proofDataToCp() {
    return 'Sender: ' + this.proofData.sender +
    '\nReceiver: ' + this.proofData.receiver +
    '\nAmount: ' + this.proofData.amount / globalConsts.GROTHS_IN_BEAM + ' BEAM' +
    '\nKernel ID: ' + this.proofData.kernel;
  }

  openInExplorerClicked() {
    window.open('https://testnet.explorer.beam.mw/block?kernel_id=' + this.proofData.kernel, '_blank');
  }
}
