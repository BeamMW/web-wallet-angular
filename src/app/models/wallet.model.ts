import {Deserializable} from './deserializable.model';

export class Wallet implements Deserializable {
  current_height: number;
  current_state_hash: string;
  prev_state_hash: string;
  available: number;
  receiving: number;
  sending: number;
  maturing: number;
  locked: number;
  difficulty: number;
  name: string;
  port: string;

  deserialize(input: any) {
    Object.assign(this, input);
    return this;
  }
}
