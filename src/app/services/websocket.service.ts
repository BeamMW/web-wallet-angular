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
            return this.wsMessages$.next(msg);
          },
          (err) => console.log(err),
          () => console.log('service connected')
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

    private sendKeykeeperResult(id, result) {
        console.log(`[ws serivce] keykeeper result: ${result}`);
        this.send({
            jsonrpc: '2.0',
            id: id,
            result: JSON.parse(result)
        });
    }

    private sendKeykeeperError(id, error) {
        console.log(`[ws serivce] keykeeper error: ${error}`);
        this.send({
            jsonrpc: '2.0',
            id,
            error
        });
    }


    public onkeykeeper(data) {
        const handlers = {
            get_kdf: () => this.sendKeykeeperResult(data.id, this.wasmService.keyKeeper.get_Kdf(data.params.root, 
                    data.params.child_key_num)),
            get_slots: () => this.sendKeykeeperResult(data.id, this.wasmService.keyKeeper.get_NumSlots()),
            create_output: () =>
            this.sendKeykeeperResult(data.id, this.wasmService.keyKeeper.CreateOutput(data.params.scheme, data.params.id)),
            sign_receiver: () =>
            this.sendKeykeeperResult(data.id, this.wasmService.keyKeeper.SignReceiver(data.params.inputs,
                data.params.outputs, data.params.kernel, data.params.non_conv, data.params.peer_id, data.params.my_id_key)),
            sign_sender: () =>
            this.sendKeykeeperResult(data.id, this.wasmService.keyKeeper.SignSender(data.params.inputs, data.params.outputs,
                data.params.kernel, data.params.non_conv, data.params.peer_id, data.params.my_id_key, data.params.slot,
                data.params.agreement, data.params.my_id)),
            sign_split: () =>
            this.sendKeykeeperResult(data.id, this.wasmService.keyKeeper.SignSplit(data.params.inputs, data.params.outputs,
                data.params.kernel, data.params.non_conv)),
        };

        handlers[data.method]
            ? handlers[data.method]()
            : this.sendKeykeeperError(data.id, `unknown method: ${data.method}`);
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
