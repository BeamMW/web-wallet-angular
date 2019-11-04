import {Deserializable} from './deserializable.model';

export class Transaction implements Deserializable {
  txId: string;
  comment: string;
  fee: number;
  kernel: string;
  receiver: string;
  sender: string;
  status: number;
  value: any;
  height: number;
  confirmations: number;
  statusName: string;
  show: boolean;
  tableData: any;

  deserialize(input: any) {
    Object.assign(this, input);
    return this;
  }
}
