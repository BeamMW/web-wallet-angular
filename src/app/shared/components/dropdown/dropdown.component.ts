import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { environment } from '@environment';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent implements OnInit {
  @Output() menuChanged = new EventEmitter<string>();
  @Input() menuItems: any;
  @Input() selectedItem: any;

  public iconDrop: string = `${environment.assetsPath}/images/modules/addresses/components/address-type-menu/arrow.svg`;
  isDropdownVisible = false;

  constructor() {
  }

  changeDropdownState(event) {
    event.stopPropagation();
    this.isDropdownVisible = !this.isDropdownVisible;
  }

  selectItem(item) {
    this.selectedItem = item;
    this.isDropdownVisible = false;
    this.menuChanged.emit(item);
  }

  onClickedOutside() {
    this.isDropdownVisible = !this.isDropdownVisible;
  }

  ngOnInit() {
  }
}
