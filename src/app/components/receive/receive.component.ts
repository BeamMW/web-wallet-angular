import { ElementRef, ViewChild, Component, OnInit, HostListener } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DataService} from '../../services/data.service';
import {Location} from '@angular/common';

@Component({
  selector: 'app-receive',
  templateUrl: './receive.component.html',
  styleUrls: ['./receive.component.css']
})
export class ReceiveComponent implements OnInit {
  @ViewChild('addressInput', {static: false}) public addressInput: ElementRef;
  @ViewChild('commentInput', {static: false}) public commentInput: ElementRef;

  isExpiresVisible = false;
  port: string;
  currentAddress;
  blocksChartTypes = [
      {num: 1, name: '24 hours', value: '24h', isSelected: true},
      {num: 2, name: 'never', value: 'never', isSelected: false}
  ];
  selectedExpireTime = this.blocksChartTypes[0];

  @HostListener('document:click', ['$event']) clickout(event) {
    this.isExpiresVisible = false;
  }
  constructor(private dataService: DataService,
              private router: Router,
              private route: ActivatedRoute,
              private _location: Location) { }

  showTypesOptions(event) {
    event.stopPropagation();
    this.isExpiresVisible = !this.isExpiresVisible;
  }

  expireTimeChanged(selectedTime) {
    this.selectedExpireTime = selectedTime;
    this.dataService.editAddress(this.port, this.currentAddress,
        this.selectedExpireTime.value, this.commentInput.nativeElement.value).subscribe((address) => {});
  }

  closeClicked() {
    this.dataService.editAddress(this.port, this.currentAddress,
        this.selectedExpireTime.value, this.commentInput.nativeElement.value).subscribe((address) => {
          this._location.back();
    });
  }

  copyClicked() {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.addressInput.nativeElement.value;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

  ngOnInit() {
    this.port = this.route.snapshot.parent.params.port;
    this.dataService.createAddress(this.port).subscribe((address) => {
      this.addressInput.nativeElement.value = address;
      this.currentAddress = address;
    });
  }

}
