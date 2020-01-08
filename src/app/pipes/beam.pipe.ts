import { Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Pipe({
  name: 'beam'
})
export class BeamPipe implements PipeTransform {

  constructor(private decimalPipe: DecimalPipe) {

  }
  transform(value: any, digits?: any): any {
    return this.decimalPipe.transform(value / 100000000, digits)
  }

}