import {Deserializable} from './deserializable.model';

export class Utxo implements Deserializable {
  id: number;
  amount: number;
  height: number;
  maturity: number;
  type: string;
  createTxId: string;
  spentTxId: string;

  deserialize(input: any) {
    Object.assign(this, input);
    return this;
  }
}
