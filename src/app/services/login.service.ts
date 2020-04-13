import { Injectable } from '@angular/core';
import * as ObservableStore from 'obs-store';
import { Subject, Observable, Subscription } from 'rxjs';
import { webSocket, WebSocketSubject} from 'rxjs/webSocket';
import { map } from 'rxjs/operators';
import { WasmService } from './../wasm.service';

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
        private wasm: WasmService
    ) {
        this.wsMessages$ = new Subject();
    }

    init() {
        this.loginParams.WalletID = this.wasm.getWalletID();
    }

    connect() {
        this.subject = new WebSocketSubject('ws://3.222.86.179:20000/ws');

        this.subject.subscribe(
          (msg) => {
            return this.wsMessages$.next(msg);
          },
          (err) => console.log(err),
          () => console.log('login connected')
        );
        this.setConnected(true);
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
        } else {
            console.error('Send error!');
        }
    }

    disconnect(err?) {
        if (err) { console.error(err); }
        this.setConnected(false);
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
