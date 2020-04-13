import { Injectable } from '@angular/core';
import * as ObservableStore from 'obs-store';
import { Subject, Observable, Subscription } from 'rxjs';
import { webSocket, WebSocketSubject} from 'rxjs/webSocket';
import { map } from 'rxjs/operators';
import { WasmService } from './../wasm.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
    public WalletID;
    public SbbsAddress;
    public SbbsAddressPrivate;

    private sub: Subscription;

    name: string;
    message: string;
    numberOfMessages = 0;

    private wsMessages$: Subject<any>;
    message$: Observable<any>;

    public url: string;
    connected: boolean;

    private subject: any;


    constructor(
        private wasmService: WasmService
    ) {
        this.wsMessages$ = new Subject();
    }

    connect() {
        this.subject = new WebSocketSubject(this.url);

        this.subject.subscribe(
          (msg) => {
            if (msg.result !== undefined || msg.error !== undefined){
                this.wsMessages$.next(msg);
            } else if (msg.method !== undefined) {
                this.onkeykeeper(JSON.stringify(msg));
            }
          },
          (err) => console.log(err),
          () => console.log('service connected')
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
            map((message: any) => {
                console.log("MESSAGE:", message);
                return message;
            })
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

    public onkeykeeper(data) {
        console.log(`<<< keykeeper request: ${data}`);
        const res = this.wasmService.keyKeeper.invokeServiceMethod(data);
        const result = JSON.parse(res);
        console.log(`>>> keykeeper response: ${res}`);
        this.send(result);
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
