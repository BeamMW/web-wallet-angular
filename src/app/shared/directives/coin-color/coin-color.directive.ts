import { Directive, OnInit, Input, ElementRef, HostBinding } from '@angular/core';
import { transactionsStatuses, statusesColors } from '@consts';
import { Store, select } from '@ngrx/store';
//import { selectAddress } from '../../../store/selectors/address.selectors';

@Directive({
  selector: '[appCoinColor]'
})
export class CoinColorDirective implements OnInit {
  @Input('appCoinColorTransaction') transaction: any;

  constructor(
    private store: Store<any>,
    private el: ElementRef
  ) { }

  ngOnInit() {
    if (this.transaction !== undefined) {
      this.el.nativeElement.style.color = this.getColor(this.transaction);
    } 
  }

  getColor(transaction) {
    return transaction.income ? statusesColors.RECEIVE : statusesColors.SEND;
  }
}
