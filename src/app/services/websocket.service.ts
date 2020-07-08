import { Injectable } from '@angular/core';
import { Subject, Observable, Subscription } from 'rxjs';
import { webSocket, WebSocketSubject} from 'rxjs/webSocket';
import { map } from 'rxjs/operators';
import { WasmService } from './../wasm.service';
import { Store } from '@ngrx/store';
import {
    saveError,
    needToReconnect
} from '../store/actions/wallet.actions';
import { LogService } from './log.service';

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
        private logService: LogService,
        private store: Store<any>,
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
            this.store.dispatch(saveError({errorValue:
                {
                  gotAnError: false,
                  errorMessage: ''
                }
            }));
          },
          (err) => {
              if (err.code === 1006) {
                this.logService.saveDataToLogs('[Socket: reconnect]', err);
                console.log('[reconnect triggered]');
                this.store.dispatch(needToReconnect({isNeedValue: true}));
              } else {
                this.store.dispatch(saveError({errorValue:
                    {
                      gotAnError: true,
                      errorMessage: 'Connectivity problem'
                    }
                }));
              }
              this.setConnected(false);
              this.logService.saveDataToLogs('[Socket: error]', err);
              console.log('error from socket:', err);
          },
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
            map((message: any) => message)
        );
    }


    /*
    * on message to server
    * */
    public send(data: any = {}): void {
        if (this.connected) {
            this.store.dispatch(saveError({errorValue:
                {
                  gotAnError: false,
                  errorMessage: ''
                }
            }));
            this.subject.next(data);
        } else {
            console.error('Send error!');
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

    public onkeykeeper(data) {
        this.logService.saveDataToLogs('[Keykeeper: request]', data);
        console.log(`<<< keykeeper request: ${data}`);
        const res = this.wasmService.keyKeeper.invokeServiceMethod(data);
        const result = JSON.parse(res);
        this.logService.saveDataToLogs('[Keykeeper: response]', res);
        console.log(`>>> keykeeper response: ${res}`);
        this.send(result);
    }
}
