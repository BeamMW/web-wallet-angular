import { Injectable } from '@angular/core';
import * as ObservableStore from 'obs-store';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  store: any;

  constructor() {
    this.store = new ObservableStore();
  }
}
