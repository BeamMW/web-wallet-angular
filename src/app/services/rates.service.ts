import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import * as coingeckoAPI from 'coingecko-api';

const INTERVAL_VALUE = 310000;

@Injectable({
  providedIn: 'root'
})
export class RatesService {
    private coinGeckoClient: any;
    public data = {
        usd: 0
    };

    constructor() {
        this.coinGeckoClient = new coingeckoAPI();
    }

    private loadRates = async () => {
        try {
            const coinGeckoResult = await this.coinGeckoClient.simple.price({
                ids: ['beam'],
                vs_currencies: ['btc', 'usd'],
            });
            this.data.usd = coinGeckoResult.data.beam.usd;
        } catch(err) {
            console.log('coinGeckoApi ERROR:', err);
        }
    }

    public start() {
        this.loadRates();
        setInterval(this.loadRates, INTERVAL_VALUE);
    }
}
