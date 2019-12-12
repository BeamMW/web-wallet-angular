import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-send',
  templateUrl: './send.component.html',
  styleUrls: ['./send.component.scss']
})
export class SendComponent implements OnInit {

  constructor(public router: Router) { }

  ngOnInit() {
  }

  back() {
    this.router.navigate(
      ['/wallet/main']
    );
  }

}
