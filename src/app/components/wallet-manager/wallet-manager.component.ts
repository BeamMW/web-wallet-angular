import {Component, OnInit, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {DataService} from '../../services/data.service';
import {Wallet} from '../../models';
import { Router} from '@angular/router';

export interface DialogData {
  port: string;
  name: string;
}

@Component({
  selector: 'app-wallet-manager',
  templateUrl: './wallet-manager.component.html',
  styleUrls: ['./wallet-manager.component.css']
})
export class WalletManagerComponent implements OnInit {

  name: string;
  port: string;

  wallets: Wallet[];

  constructor(
    public dialog: MatDialog,
    private dataService: DataService,
    private router: Router) {}

  showWallet(port) {
    this.router.navigate(
      ['wallet/' + port + '/transactions']
    );
  }

  removeWallet(event, wallet) {
    event.stopPropagation();
    this.dataService.deleteWallet(wallet.port).subscribe(() => {
       const walletToRemove = this.wallets.find(walletItem => walletItem.port === wallet.status);
       this.wallets.splice( this.wallets.indexOf(walletToRemove), 1 );
    });
  }

  openDialog() {
    const dialogRef = this.dialog.open(WalletManagerDialogComponent, {
      width: '250px',
      data: {name: this.name, port: this.port}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.dataService.addWallet({'name': result.value.name, 'port': result.value.port}).subscribe(() => {
          this.dataService.loadWalletStatus(result.value.port).subscribe((status) => {
            status.name = result.value.name;
            status.port = result.value.port;
            this.wallets.push(status);
          },  error => {});
        });
      }
    });
  }

  ngOnInit() {
    this.wallets = [];

    this.dataService.tx_swap_init().subscribe(() => {
      console.log('wallets ready to swapping');
    });

    this.dataService.loadWalletsList().subscribe((list) => {
      list.map((item) => {
        this.dataService.loadWalletStatus(item.port).subscribe((status) => {
          status.name = item.name;
          status.port = item.port;
          this.wallets.push(status);
        },  error => {});
      });
    });
  }
}

@Component({
  selector: 'app-wallet-manager-dialog',
  templateUrl: 'wallet-manager-dialog.html',
})
export class WalletManagerDialogComponent implements OnInit {
  public ownerForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<WalletManagerDialogComponent>,
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
