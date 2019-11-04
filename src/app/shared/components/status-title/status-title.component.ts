import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-status-title',
  templateUrl: './status-title.component.html',
  styleUrls: ['./status-title.component.css']
})
export class StatusTitleComponent implements OnInit {
  @Input() title: string;
  constructor() { }

  ngOnInit() {
  }

}
