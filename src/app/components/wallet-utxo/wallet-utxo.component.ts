import { Component, OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';
import {ActivatedRoute, Router} from '@angular/router';

const GROTHS_IN_BEAM = 100000000;

@Component({
  selector: 'app-wallet-utxo',
  templateUrl: './wallet-utxo.component.html',
  styleUrls: ['./wallet-utxo.component.css']
})

export class WalletUtxoComponent implements OnInit {
  displayedColumns: string[] = ['amount', 'maturity', 'status', 'type'];

  utxo_loading: boolean;
  status_loading: boolean;

  port: string;
  utxo_list: any;
  wallet_status: any;
  constructor(
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.status_loading = true;
    this.port = this.route.snapshot.parent.params.port;

    this.dataService.loadWalletStatus(this.port).subscribe((status) => {
      this.wallet_status = status;
      this.status_loading = false;
    });

    this.dataService.loadUtxo(this.port).subscribe((list) => {
      this.utxo_list = list.map((item) => {
        item.amount /= GROTHS_IN_BEAM;
        return item;
      });
      this.utxo_loading = false;
    });
  }
}
