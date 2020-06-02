import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainLayoutComponent } from './layouts';
import { RouterModule } from '@angular/router';
import { HeaderLogoComponent, HeaderPopupComponent, ButtonComponent, MenuComponent } from './components';
import { BeamPipe } from 'app/pipes/beam.pipe';
import { DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TextareaAutosizeModule } from 'ngx-textarea-autosize';
import { ClipboardModule } from 'ngx-clipboard';
import { TooltipModule } from 'ng2-tooltip-directive';

import {
  MatToolbarModule,
  MatSortModule,
  MatTableModule,
  MatMenuModule
} from '@angular/material';

import {
  WalletStatusTitleComponent,
  TransactionListComponent,
  DropdownComponent,
  MenuFullComponent,
  TableComponent,
  PaymentProofComponent,
  TableActionsComponent,
  PasswordComponent,
  AddContactComponent,
  PaymentProofExportedComponent,
  StatusIconComponent
 } from './components';

import {
  HeaderComponent,
  HeaderWithLinkComponent,
  HeaderWithoutLogoComponent
} from './containers';
import {
  ClickOutsideDirective,
  DetectCapsDirective,
  NumbersOnlyDirective,
  StatusColorDirective
} from './directives';

@NgModule({
  declarations: [
    WalletStatusTitleComponent,
    MainLayoutComponent,
    HeaderComponent,
    HeaderLogoComponent,
    HeaderPopupComponent,
    ButtonComponent,
    MenuComponent,
    ClickOutsideDirective,
    BeamPipe,
    DropdownComponent,
    MenuFullComponent,
    TableComponent,
    TransactionListComponent,
    PaymentProofComponent,
    TableActionsComponent,
    PasswordComponent,
    AddContactComponent,
    PaymentProofExportedComponent,
    HeaderWithLinkComponent,
    HeaderWithoutLogoComponent,
    DetectCapsDirective,
    NumbersOnlyDirective,
    StatusIconComponent,
    StatusColorDirective,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TextareaAutosizeModule,
    ClipboardModule,
    TooltipModule,

    MatToolbarModule,
    MatSortModule,
    MatTableModule,
    MatMenuModule
  ],
  exports: [
    WalletStatusTitleComponent,
    MainLayoutComponent,
    HeaderComponent,
    ButtonComponent,
    MenuComponent,
    ClickOutsideDirective,
    BeamPipe,
    DropdownComponent,
    MenuFullComponent,
    TableComponent,
    PasswordComponent,
    HeaderWithLinkComponent,
    HeaderWithoutLogoComponent,
    TableActionsComponent,
    DetectCapsDirective,
    NumbersOnlyDirective,
    StatusIconComponent,
    StatusColorDirective
  ],
  providers: [
    DecimalPipe
  ]
})
export class SharedModule { }
