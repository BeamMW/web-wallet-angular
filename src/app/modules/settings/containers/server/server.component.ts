import { Component, OnInit } from '@angular/core';
import { environment } from '@environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-server',
  templateUrl: './server.component.html',
  styleUrls: ['./server.component.scss']
})
export class ServerComponent implements OnInit {
  public iconBack: string = `${environment.assetsPath}/images/modules/send/containers/send-addresses/icon-back.svg`;

  constructor(public router: Router) { }

  ngOnInit() {
  }

  backClicked(event) {
    event.stopPropagation();
    this.router.navigate(['/settings/all']);
  }
}
