import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Location} from '@angular/common';
import {DataService} from '../../services/data.service';
import {ActivatedRoute, Router} from '@angular/router';

const GROTHS_IN_BEAM = 100000000;

@Component({
  selector: 'app-send',
  templateUrl: './send.component.html',
  styleUrls: ['./send.component.css']
})
export class SendComponent implements OnInit {
  @ViewChild('sendToInput', {static: false}) public sendToInput: ElementRef;
  @ViewChild('commentInput', {static: false}) public commentInput: ElementRef;
  @ViewChild('amountInput', {static: false}) public amountInput: ElementRef;
  @ViewChild('feeInput', {static: false}) public feeInput: ElementRef;

  port: string;
  constructor(private _location: Location,
              private router: Router,
              private route: ActivatedRoute,
              private dataService: DataService) { }

  cancelClicked() {
    this._location.back();
  }

  sendClicked() {
    this.dataService.createAddress(this.port).subscribe((address) => {
      this.dataService.txSend(this.port, this.amountInput.nativeElement.value * GROTHS_IN_BEAM,
      this.feeInput.nativeElement.value, address, this.sendToInput.nativeElement.value,
      this.commentInput.nativeElement.value).subscribe((result) => {
          this._location.back();
    });
    });
  }

  ngOnInit() {
    this.port = this.route.snapshot.parent.params.port;
    this.feeInput.nativeElement.value = 10;
  }

}
