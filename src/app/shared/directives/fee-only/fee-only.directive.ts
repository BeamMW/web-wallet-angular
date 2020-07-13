import { Directive, HostListener, ElementRef } from '@angular/core';
import Big from 'big.js';

@Directive({
  selector: '[appFeeOnly]'
})
export class FeeOnlyDirective {

  private MAX_AMOUNT = 1000000000;

  private regex: RegExp = new RegExp(/^\d+$/g);
  private specialKeys: Array<string> = [
    'Backspace', 'Tab', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp',
    'Control', 'Delete', 'F5'
  ];

  constructor(private el: ElementRef) {
  }

  handleString(next) {
    let result = true;
    if ((next && !String(next).match(this.regex)) ||
        (parseFloat(next) > this.MAX_AMOUNT)) {
      result = false;
    }
    return result;
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    const current: string = this.el.nativeElement.value;
    const next: string = current.concat(event.key);

    if (!this.handleString(next)) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    const text = event.clipboardData.getData('text');
    if (!this.handleString(text)) {
      event.preventDefault();
    }
      // if (!this.handleString(event.target.value)) {
      //   event.preventDefault();
      //   event.stopPropagation();
      // }
  }
}
