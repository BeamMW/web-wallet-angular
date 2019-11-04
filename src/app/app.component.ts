import { Component, OnInit } from '@angular/core';
import { WasmService } from './wasm.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private wasm: WasmService) {}

  ngOnInit() {
  }

  testKeykeeper() {
    this.wasm.keyKeeper().subscribe(value => {
    });
  }
}
