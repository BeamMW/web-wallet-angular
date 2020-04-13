import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { environment } from '@environment';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-table-actions',
  templateUrl: './table-actions.component.html',
  styleUrls: ['./table-actions.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TableActionsComponent implements OnInit {
  isDropdownVisible = false;
  public iconActions: string = `${environment.assetsPath}/images/shared/components/table/icon-actions.svg`;

  public saveIcon = `${environment.assetsPath}/images/shared/components/table-actions/ic-add-copy.svg`;
  public shareIcon = `${environment.assetsPath}/images/shared/components/table-actions/ic-share-white.svg`;
  public copyIcon = `${environment.assetsPath}/images/shared/components/table-actions/ic-copy-small-white.svg`;
  public repeatIcon = `${environment.assetsPath}/images/shared/components/table-actions/icon-repeat.svg`;
  public cancelIcon = `${environment.assetsPath}/images/shared/components/table-actions/icon-cancel-copy.svg`;
  public deleteIcon = `${environment.assetsPath}/images/shared/components/table-actions/ic-delete.svg`;

  constructor(
    private store: Store<any>,
    public router: Router) {
  }

  ngOnInit() {
  }

  saveContactClicked() {

  }
}

