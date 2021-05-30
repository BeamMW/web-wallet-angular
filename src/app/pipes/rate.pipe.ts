import { Pipe, PipeTransform } from '@angular/core';
import Big from 'big.js';
import { RatesService } from '@app/services';

@Pipe({
    name: 'rate'
})
export class RatePipe implements PipeTransform {
    constructor(private ratesService: RatesService) {
    }

    transform(amount: number, args?: any): string {
        if (amount == 0) {
            return '0 USD';
        } else if (amount > 0.01) {
            return new Big(amount).times(this.ratesService.data.usd).toFixed(2) + ' USD';
        } else {
            return '< 1 cent';
        }
    }
}