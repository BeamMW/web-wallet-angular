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
        return (new Big(amount ? amount : 0)).
            times(this.ratesService.data.usd).toFixed();
    }
}