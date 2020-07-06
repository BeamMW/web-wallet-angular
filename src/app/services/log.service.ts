import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class LogService {
    private sessionLogs = [];

    constructor(
        private datePipe: DatePipe,
    ) {
    }

    public saveDataToLogs(preLog, log) {
        const currentDate = new Date();
        const logsData = JSON.stringify(log);
        this.sessionLogs.push(this.datePipe.transform(currentDate, 'yyyy-MM-dd.HH:mm:ss.sss') + ' ' +
          preLog + ' ' + logsData + '\r\n');
    }

    public saveLogsToFile() {
        const blob = new Blob(this.sessionLogs, {type: 'text/plain;charset=utf-8'});
        const currentDate = new Date();
        saveAs(blob, 'web-wallet-logs-' + this.datePipe.transform(currentDate, 'yyyy_MM_dd_HH_mm_ss') + '.txt');
    }

    public emptyLogs() {
        this.sessionLogs = [];
    }
}
