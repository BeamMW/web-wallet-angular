import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { environment } from '@environment';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { selectContact } from '../../../store/selectors/wallet-state.selectors';
import {Observable, from} from 'rxjs';
import { ClipboardService } from 'ngx-clipboard';
import { TableTypes } from '@consts';

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

  isDropdownVisible = false;
  public iconActions: string = `${environment.assetsPath}/images/shared/components/table/icon-actions.svg`;

  public saveIcon = `${environment.assetsPath}/images/shared/components/table-actions/ic-add-copy.svg`;
  public shareIcon = `${environment.assetsPath}/images/shared/components/table-actions/ic-share-white.svg`;
  public copyIcon = `${environment.assetsPath}/images/shared/components/table-actions/ic-copy-small-white.svg`;
  public repeatIcon = `${environment.assetsPath}/images/shared/components/table-actions/icon-repeat.svg`;
  public cancelIcon = `${environment.assetsPath}/images/shared/components/table-actions/icon-cancel-copy.svg`;
  public deleteIcon = `${environment.assetsPath}/images/shared/components/table-actions/ic-delete.svg`;

  public editIcon = `${environment.assetsPath}/images/shared/components/table-actions/icon-edit-copy.svg`;
  public expireIcon = `${environment.assetsPath}/images/shared/components/table-actions/icon-exp-copy-2.svg`;

  constructor(
    private _clipboardService: ClipboardService,
    private store: Store<any>,
    public router: Router) {
  }

  ngOnInit() {
    this.address = this.element.income ? this.element.sender : this.element.receiver;
  }

  saveContactClicked($event) {
    $event.stopPropagation();
    this.contact$ = this.store.pipe(select(selectContact(this.address)));
    this.contact$.subscribe((state) => {
      if (state === undefined) {
        this.router.navigate([this.router.url, {
          outlets: {
            popup: ['add-contact', this.address]
          }
        }]);
      }
    });
  }

  copyAddressClicked() {
    this._clipboardService.copyFromContent(this.element.address);
  }
}
