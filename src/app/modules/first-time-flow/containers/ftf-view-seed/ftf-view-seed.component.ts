import { Component, OnInit } from '@angular/core';
import { environment } from '@environment';
import { Router } from '@angular/router';
import { WasmService } from '../../../../wasm.service';
import { Store, select } from '@ngrx/store';
import { selectWasmState } from '../../../../store/selectors/wallet-state.selectors';
import { Observable, Subscription } from 'rxjs';
import { addSeedPhrase } from './../../../../store/actions/wallet.actions';
import { WindowService } from '../../../../services';

@Component({
  selector: 'app-ftf-view-seed',
  templateUrl: './ftf-view-seed.component.html',
  styleUrls: ['./ftf-view-seed.component.scss']
})
export class FtfViewSeedComponent implements OnInit {
  public iconBack: string = `${environment.assetsPath}/images/modules/send/containers/send-addresses/icon-back.svg`;
  passwordCreateRoute = '/initialize/create-password';
  passwordCompleteRoute = '/initialize/confirm-seed';

  seed: string;
  wasmState$: Observable<any>;
  private sub: Subscription;
  public isFullScreen = false;
  seedState = [];

  constructor(
      private store: Store<any>,
      private wasm: WasmService,
      private windowService: WindowService,
      public router: Router) {
    this.isFullScreen = this.windowService.isFullSize();
  }
  ngOnInit() {
    this.wasmState$ = this.store.pipe(select(selectWasmState));
    this.sub = this.wasmState$.subscribe((state) => {
        if (state) {
          this.seed = this.wasm.generatePhrase();
          this.store.dispatch(addSeedPhrase({seedPhraseValue: this.seed}));
          if (this.sub) {
            this.sub.unsubscribe();
          }
        }
    });
    this.seedState = this.seed.split(' ');
  }

  backClicked(event) {
    event.stopPropagation();
    this.router.navigate(['/initialize/generate-seed']);
  }
}
