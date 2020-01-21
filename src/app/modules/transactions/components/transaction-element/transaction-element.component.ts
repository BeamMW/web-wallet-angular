import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { environment } from '@environment';

@Component({
  selector: 'app-transaction-element',
  templateUrl: './transaction-element.component.html',
  styleUrls: ['./transaction-element.component.scss']
})
export class TransactionElementComponent implements OnInit {
  @Input() transaction: any;
  public iconReceived: string = `${environment.assetsPath}/images/modules/wallet/containers/main/icon-received.svg`;
  public iconSent: string = `${environment.assetsPath}/images/modules/wallet/containers/main/icon-sent.svg`;
  public iconDrop: string = `${environment.assetsPath}/images/modules/addresses/components/address-type-menu/arrow.svg`;
  public iconComment: string = `${environment.assetsPath}/images/modules/transactions/components/transaction-element/icn-comment-copy.svg`;

  constructor() {
  }

  isCommentDefault(comment) {
    return comment === 'default';
  }

  itemSelected(transactionData) {
    
  }

  ngOnInit() {
  }
}
