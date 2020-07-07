import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appNumbersOnly]'
})
export class NumbersOnlyDirective {

  private MIN_AMOUNT = 0.00000001;
  private MAX_AMOUNT = 254000000;

  private regex: RegExp = new RegExp(/^-?\d+(\.\d*)?$/g);
  private specialKeys: Array<string> = [
    'Backspace', 'Tab', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp',
    'Control'
  ];

  constructor(private el: ElementRef) {
  }
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    const current: string = this.el.nativeElement.value;
    const next: string = current.concat(event.key);
    const afterDot = next.indexOf('.') > 0 ? next.substring(next.indexOf('.') + 1) : '0';
    if ((next && !String(next).match(this.regex)) ||
        (String(next).length > 1 && String(next)[0] === '0' && next.indexOf('.') < 0) ||
        (parseInt(afterDot, 10) === 0 && afterDot.length > 7) ||
        (afterDot.length > 8) ||
        (parseFloat(next) === 0 && next.length > 1 && next[1] !== '.') ||
        (parseFloat(next) < 1 && next.length > 10) ||
        (parseFloat(next) > 0 && (parseFloat(next) < this.MIN_AMOUNT || parseFloat(next) > this.MAX_AMOUNT))) {
      event.preventDefault();
    }
  }
}