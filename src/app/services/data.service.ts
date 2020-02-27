import { Injectable } from '@angular/core';
import * as ObservableStore from 'obs-store';
import { Subject } from 'rxjs';
import * as extensionizer from 'extensionizer';
import { WalletState } from './../models/wallet-state.model';
import { Store, select } from '@ngrx/store';
import { selectAppState, selectWalletOptions } from '../store/selectors/wallet-state.selectors';
import { loadWalletState, saveWallet } from '../store/actions/wallet.actions';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  sendStore: any;
  options$: Observable<any>;
  appState$: Observable<any>;

  // Observable string sources
  private emitChangeSource = new Subject<any>();
  // Observable string streams
  changeEmitted$ = this.emitChangeSource.asObservable();
  // Service message commands
  emitChange(change: any) {
      this.emitChangeSource.next(change);
  }

  constructor(private store: Store<any>) {
    this.sendStore = new ObservableStore();
  }

  public optionsInit() {
    extensionizer.storage.local.set({options: {
      privacy: false
    }});
  }

  public saveWallet(data) {
    this.store.dispatch(saveWallet({wallet: data}));
    extensionizer.storage.local.set({wallet: data});
  }

  public saveAppState(value) {
    extensionizer.storage.local.set({state: value});
  }

  public saveWalletOptions() {
    this.options$ = this.store.pipe(select(selectWalletOptions));
    this.options$.subscribe((state) => {
      extensionizer.storage.local.set({options: state});
    });
  }

  loadAppState() {
    return new Promise<WalletState>((resolve, reject) => {
      extensionizer.storage.local.get('state', (result) => {
        resolve(result.state);
      });
    });
  }

  loadWalletData() {
    return new Promise<string>((resolve, reject) => {
      extensionizer.storage.local.get('wallet', (result) => {
        resolve(result.wallet);
      });
    });
  }

  loadWalletOptions() {
    return new Promise<string>((resolve, reject) => {
      extensionizer.storage.local.get('options', (result) => {
        resolve(result.options);
      });
    });
  }
}