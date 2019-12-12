export interface Utxo {
    id: string;
    amount: number;
    maturity: number;
    status_string: string;
    session: 0;
    spentTxId: string;
    status: number;
    type: string;
    createTxId: string;
}
