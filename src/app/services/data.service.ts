import { Injectable } from '@angular/core';
import * as ObservableStore from 'obs-store';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  store: any;
  sendStore: any;

  // Observable string sources
  private emitChangeSource = new Subject<any>();
  // Observable string streams
  changeEmitted$ = this.emitChangeSource.asObservable();
  // Service message commands
  emitChange(change: any) {
      this.emitChangeSource.next(change);
  }

  constructor() {
    this.store = new ObservableStore();
    this.sendStore = new ObservableStore();
  }
}
