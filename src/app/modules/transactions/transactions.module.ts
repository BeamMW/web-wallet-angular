import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionsViewComponent } from './containers/transactions-view/transactions-view.component';
import { TransactionDetailsComponent } from './containers/transaction-details/transaction-details.component';
import { SharedModule } from '../../shared/shared.module';
import { TransactionsRoutingModule } from './transactions-routing.module';
import { TransactionElementComponent } from './components/transaction-element/transaction-element.component';
import { ClipboardModule } from 'ngx-clipboard';

@NgModule({
  declarations: [
    TransactionsViewComponent,
    TransactionDetailsComponent,
    TransactionElementComponent
  ],
  imports: [
    ClipboardModule,
    CommonModule,
    SharedModule,
    TransactionsRoutingModule
  ]
})
export class TransactionsModule { }
