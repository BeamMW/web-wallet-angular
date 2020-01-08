import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-control',
  templateUrl: './menu-control.component.html',
  styleUrls: ['./menu-control.component.scss']
})
export class MenuControlComponent implements OnInit {

  constructor(public router: Router) { }

  ngOnInit() {
  }

  sideMenuClicked() {
    this.router.navigate([this.router.url, { outlets: { sidemenu: 'menu' }}]);
  }
}
