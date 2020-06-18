import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { environment } from '@environment';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { selectContact } from '../../../store/selectors/wallet-state.selectors';
import {Observable, from, Subscription} from 'rxjs';
import { ClipboardService } from 'ngx-clipboard';
import { TableTypes } from '@consts';
import { DataService, WindowService, WebsocketService } from './../../../services';

@Component({
  selector: 'app-table-actions',
  templateUrl: './table-actions.component.html',
  styleUrls: ['./table-actions.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TableActionsComponent implements OnInit {
  @Input() tableType: any;
  @Input() element: any;
  address: string;
  contact$: Observable<any>;
  tableTypesConsts = TableTypes;
  private sub: Subscription;

  isDropdownVisible = false;
  public iconActions: string = `${environment.assetsPath}/images/shared/components/table/icon-actions.svg`;

  private basePath = `${environment.assetsPath}/images/shared/components/table-actions/`;
  public componentIcons = {
    cancelIconActive: this.basePath + `icon-cancel-active.svg`,
    cancelIcon: this.basePath + `icon-cancel.svg`,
    cancelActualIcon: this.basePath + `icon-cancel.svg`,
    deleteIconActive: this.basePath + `icon-delete-active.svg`,
    deleteIcon: this.basePath + `icon-delete.svg`,
    deleteActualIcon: this.basePath + `icon-delete.svg`,
  };

  public saveIcon = `${environment.assetsPath}/images/shared/components/table-actions/ic-add-copy.svg`;
  public shareIcon = `${environment.assetsPath}/images/shared/components/table-actions/ic-share-white.svg`;
  public copyIcon = `${environment.assetsPath}/images/shared/components/table-actions/ic-copy-small-white.svg`;
  public repeatIcon = `${environment.assetsPath}/images/shared/components/table-actions/icon-repeat.svg`;
  public editIcon = `${environment.assetsPath}/images/shared/components/table-actions/icon-edit-copy.svg`;
  public expireIcon = `${environment.assetsPath}/images/shared/components/table-actions/icon-exp-copy-2.svg`;

  constructor(
    private clipboardService: ClipboardService,
    private store: Store<any>,
    private dataService: DataService,
    private windowService: WindowService,
    private wsService: WebsocketService,
    public router: Router) {
  }

  ngOnInit() {
    this.address = this.element.income ? this.element.sender : this.element.receiver;
  }

  copyAddressClicked() {
    this.clipboardService.copyFromContent(this.element.address);
  }

  cancelTransactionClicked() {
    this.dataService.cancelTransaction(this.element.txId);
  }

  deleteTransactionClicked() {
    this.dataService.deleteTransaction(this.element.txId);
  }
}

