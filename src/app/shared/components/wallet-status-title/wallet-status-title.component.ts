import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-wallet-status-title',
  templateUrl: './wallet-status-title.component.html',
  styleUrls: ['./wallet-status-title.component.css']
})
export class WalletStatusTitleComponent implements OnInit {
  @Input() title: string;
  constructor() { }

  ngOnInit() {
  }

}
