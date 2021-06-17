import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainLayoutComponent } from './layouts';
import { RouterModule } from '@angular/router';
import { HeaderLogoComponent, HeaderPopupComponent, ButtonComponent, MenuComponent } from './components';
import { BeamPipe, RatePipe } from '@app/pipes';
import { DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TextareaAutosizeModule } from 'ngx-textarea-autosize';
import { ClipboardModule } from 'ngx-clipboard';
import { TooltipModule } from 'ng2-tooltip-directive';

import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatToolbarModule } from '@angular/material/toolbar';

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
  StatusIconComponent,
  SeedVerificationPopupComponent,
  LoaderComponent,
  ContainerHeaderComponent
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
  StatusColorDirective,
  FeeOnlyDirective,
  CoinColorDirective
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
    RatePipe,
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
    CoinColorDirective,
    SeedVerificationPopupComponent,
    LoaderComponent,
    FeeOnlyDirective,
    ContainerHeaderComponent,
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
    MatMenuModule,
    MatProgressBarModule
  ],
  exports: [
    WalletStatusTitleComponent,
    MainLayoutComponent,
    HeaderComponent,
    ButtonComponent,
    MenuComponent,
    ClickOutsideDirective,
    BeamPipe,
    RatePipe,
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
    StatusColorDirective,
    CoinColorDirective,
    LoaderComponent,
    FeeOnlyDirective,
    ContainerHeaderComponent
  ],
  providers: [
    DecimalPipe
  ]
})
export class SharedModule { }
