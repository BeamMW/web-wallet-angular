import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Location} from '@angular/common';
import {DataService} from '../../services/data.service';
import {ActivatedRoute, Router} from '@angular/router';

const GROTHS_IN_BEAM = 100000000;
const SAT_IN_BTC = 100000000;

@Component({
  selector: 'app-send-swap',
  templateUrl: './send-swap.component.html',
  styleUrls: ['./send-swap.component.css']
})
export class SendSwapComponent implements OnInit {
  @ViewChild('sendToInput', {static: false}) public sendToInput: ElementRef;
  @ViewChild('commentInput', {static: false}) public commentInput: ElementRef;
  @ViewChild('amountInput', {static: false}) public amountInput: ElementRef;
  @ViewChild('amountBtcInput', {static: false}) public amountBtcInput: ElementRef;
  @ViewChild('feeInput', {static: false}) public feeInput: ElementRef;

  port: string;
   minWidth = 64;
    width: number = this.minWidth;
  constructor(private _location: Location,
              private router: Router,
              private route: ActivatedRoute,
              private dataService: DataService) { }

  cancelClicked() {
    this._location.back();
  }

  sendClicked() {
    this.dataService.tx_swap(this.port, this.feeInput.nativeElement.value,
      this.sendToInput.nativeElement.value,
      this.amountInput.nativeElement.value * GROTHS_IN_BEAM,
      this.amountBtcInput.nativeElement.value * SAT_IN_BTC).subscribe((result) => {
          this._location.back();
    });
  }

  inputFocusOut(e) {
     if (e.target.value.length > 0) {
       e.target.style.width = ((e.target.value.length + 1) * 25) + 'px';
     } else {
       e.target.style.width = '30px';
     }
  }

  inputKeypress(e) {
    e.target.style.width = ((e.target.value.length + 1) * 25) + 'px';
  }

  ngOnInit() {
    this.port = this.route.snapshot.parent.params.port;
    this.feeInput.nativeElement.value = 10;
    this.amountInput.nativeElement.value = 0;
    this.amountBtcInput.nativeElement.value = 0;
  }
}
