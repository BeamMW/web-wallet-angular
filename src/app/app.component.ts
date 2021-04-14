import { Component, OnInit } from '@angular/core';
import { timeout } from 'rxjs/operators';
import { WasmService, RatesService } from './services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    private wasmService: WasmService,
    private ratesService: RatesService) {
  }

  ngOnInit() {
    this.wasmService.init();
    this.ratesService.start();
  }
}
