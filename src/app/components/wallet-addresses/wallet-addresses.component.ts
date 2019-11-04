import {Component, HostListener, Inject, OnInit} from '@angular/core';
import {DataService} from '../../services/data.service';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {FormControl, FormGroup, Validators} from '@angular/forms';

const GROTHS_IN_BEAM = 100000000;

export interface DialogData {
  port: string;
  name: string;
}

@Component({
  selector: 'app-wallet-addresses',
  templateUrl: './wallet-addresses.component.html',
  styleUrls: ['./wallet-addresses.component.css']
})
export class WalletAddressesComponent implements OnInit {
  addressesColumns: string[] = ['comment', 'address', 'category', 'exp_date', 'created', 'actions'];
  contactsColumns: string[] = ['comment', 'contact', 'category', 'actions'];
  addressOptions = [
      {num: 1, name: 'edit address'},
      {num: 2, name: 'delete address'}
  ];
  selectedElem: any;

  addresses_loading: boolean;
  status_loading: boolean;

  port: string;
  active_addresses_list: any;
  expired_addresses_list: any;
  contacts_list: any;
  wallet_status: any;

  addressId: string;
  comment: string;
  expired: string;

  @HostListener('document:click', ['$event']) clickout(event) {
    if (this.selectedElem !== undefined) {
      this.selectedElem.style['visibility'] = 'hidden';
    }
  }

  constructor(
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog) { }

  showOptions(event) {
    event.stopPropagation();
    if (this.selectedElem !== undefined) {
      this.selectedElem.style['visibility'] = 'hidden';
    }
    this.selectedElem = event.srcElement.nextElementSibling;
    this.selectedElem.style['visibility'] = 'visible';
  }

  itemOptionChange(event, option, item) {
    event.stopPropagation();
    if (this.addressOptions[0].num === option.num) {
      this.openDialog(item);
    } else if (this.addressOptions[1].num === option.num) {
      this.dataService.deleteAddress(this.port, item.address).subscribe((result) => {
        this.loadAdresses();
      });
    }
    this.selectedElem.style['visibility'] = 'hidden';
  }

  loadAdresses() {
    this.dataService.loadAddressesList(this.port).subscribe((list) => {
      const addresses_list = list.map((item) => {
        item.amount /= GROTHS_IN_BEAM;
        return item;
      });

      this.active_addresses_list = addresses_list.filter(address => !address.expired);
      this.expired_addresses_list = addresses_list.filter(address => address.expired);
      this.addresses_loading = false;
    });
  }

  ngOnInit() {
    this.status_loading = true;
    this.port = this.route.snapshot.parent.params.port;

    this.dataService.loadWalletStatus(this.port).subscribe((status) => {
      this.wallet_status = status;
      this.status_loading = false;
    });

    this.dataService.loadContactsList(this.port).subscribe((list) => {
      this.contacts_list = list;
    });

    this.loadAdresses();
  }

  openDialog(item) {
    this.addressId = item.address;
    this.comment = item.comment;
    this.expired = item.expired;
    const dialogRef = this.dialog.open(WalletAddressEditComponent, {
      width: '250px',
      data: {addressId: this.addressId, comment: this.comment, expired: this.expired}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        /*this.dataService.addWallet({'name': result.value.name, 'port': result.value.port}).subscribe(() => {
          this.dataService.loadWalletStatus(result.value.port).subscribe((status) => {
            status.name = result.value.name;
            status.port = result.value.port;
            this.wallets.push(status);
          },  error => {});
        });*/

        // TODO: edit address
      }
    });
  }
}

@Component({
  selector: 'app-wallet-address-edit-dialog',
  templateUrl: 'wallet-address-edit-dialog.html',
})
export class WalletAddressEditComponent implements OnInit {
  public ownerForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<WalletAddressEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

     ngOnInit() {
     this.ownerForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.maxLength(60)]),
      port: new FormControl('', [Validators.required, Validators.maxLength(20)])
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

   public hasError = (controlName: string, errorName: string) => {
    return this.ownerForm.controls[controlName].hasError(errorName);
  }

  public createOwner = (ownerFormValue) => {
    if (this.ownerForm.valid) {
      this.executeOwnerCreation(ownerFormValue);
    }
  }

  private executeOwnerCreation = (ownerFormValue) => {
    const owner: DialogData = {
      name: ownerFormValue.name,
      port: ownerFormValue.port
    };
  }
}
