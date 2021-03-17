import { Component, OnInit } from '@angular/core';
import { timeout } from 'rxjs/operators';
import { WasmService } from './services/wasm.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private wasmService: WasmService) {
  }

  ngOnInit() {
    this.wasmService.init();
  }
}
