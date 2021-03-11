import { Injectable } from '@angular/core';
import { Subject, Observable, Subscription } from 'rxjs';
import { webSocket, WebSocketSubject} from 'rxjs/webSocket';
import { map } from 'rxjs/operators';
import { WasmService } from './wasm.service';
import { environment } from '@environment';
import { Store, select } from '@ngrx/store';
import {
    saveError
} from '../store/actions/wallet.actions';
@Injectable({
  providedIn: 'root'
})
export class LoginService {
    public loginParams = {
        WalletID: '',
        SbbsAddress: '',
        SbbsAddressPrivate: ''
    }

    private sub: Subscription;

    name: string;
    message: string;
    numberOfMessages = 0;

    private wsMessages$: Subject<any>;
    message$: Observable<any>;

    url: string;
    connected: boolean;

    private subject: any;


    constructor(
        private store: Store<any>,
        private wasm: WasmService
    ) {
        this.wsMessages$ = new Subject();
    }

    init() {
        this.loginParams.WalletID = this.wasm.getWalletID();
    }

    connect() {
        this.subject = new WebSocketSubject('wss://web-wallet-testnet.beam.mw/ws');

        this.subject.subscribe(
          (msg) => {
            this.store.dispatch(saveError({errorValue:
                {
                  gotAnError: false,
                  errorMessage: ''
                }
            }));
            return this.wsMessages$.next(msg);
          },
          (err) => {
            this.store.dispatch(saveError({errorValue:
                {
                  gotAnError: true,
                  errorMessage: 'Connectivity problem'
                }
            }));
            this.setConnected(false);
            console.log(err);
          },
          () => console.log('login connected')
        );
        this.setConnected(true);
    }

    complete() {
        this.wsMessages$.complete();
        this.wsMessages$ = new Subject();
    }

    /*
    * on message event
    * */
    public on<T>(): Observable<T> {
        return this.wsMessages$.pipe(
            map((message: any) => message)
        );
    }


    /*
    * on message to server
    * */
    public send(data: any = {}): void {
        if (this.connected) {
            this.subject.next(data);
            this.store.dispatch(saveError({errorValue:
                {
                  gotAnError: false,
                  errorMessage: ''
                }
            }));
        } else {
            console.log('Send error!');
            this.store.dispatch(saveError({errorValue:
                {
                  gotAnError: true,
                  errorMessage: 'Connectivity problem'
                }
            }));
        }
    }

    disconnect(err?) {
        if (err) { console.error(err); }
        this.setConnected(false);
        if (this.subject) {
            this.subject.complete();
        }
        console.log('Disconnected');
    }

    setConnected(connected) {
        this.connected = connected;
    }


    /*
    * reconnect if not connecting or errors
    * */
    // private reconnect(): void {
    //     this.reconnection$ = interval(this.reconnectInterval)
    //         .pipe(takeWhile((v, index) => index < this.reconnectAttempts && !this.websocket$));

    //     this.reconnection$.subscribe(
    //         () => this.connect(),
    //         null,
    //         () => {
    //             // Subject complete if reconnect attemts ending
    //             this.reconnection$ = null;

    //             if (!this.websocket$) {
    //                 this.wsMessages$.complete();
    //                 this.connection$.complete();
    //             }
    //         });
    // }
}
