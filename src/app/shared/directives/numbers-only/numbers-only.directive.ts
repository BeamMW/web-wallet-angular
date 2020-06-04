import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appNumbersOnly]'
})
export class NumbersOnlyDirective {

  private MIN_AMOUNT = 0.00000001;
  private MAX_AMOUNT = 254000000;

  private regex: RegExp = new RegExp(/^-?\d+(\.\d*)?$/g);
  private specialKeys: Array<string> = ['Backspace', 'Tab'];

  constructor(private el: ElementRef) {
  }
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    const current: string = this.el.nativeElement.value;
    const next: string = current.concat(event.key);
    if ((next && !String(next).match(this.regex)) ||
        (next.substring(next.indexOf('.')).length > 8) ||
        (parseFloat(next) === 0 && next.length > 9) ||
        (parseFloat(next) === 0 && next.length > 1 && next[1] !== '.') ||
        (parseFloat(next) < 1 && next.length > 10) ||
        (parseFloat(next) > 0 && (parseFloat(next) < this.MIN_AMOUNT || parseFloat(next) > this.MAX_AMOUNT))) {
      event.preventDefault();
    }
  }
}