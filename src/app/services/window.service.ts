import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })
export class WindowService {

  get windowRef() {
    return window;
  }

  isFullSize() {
      return window.innerWidth > 400;
  }
}
