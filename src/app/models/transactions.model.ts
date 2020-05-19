export interface Transaction {
    create_time: string;
    receiver: string;
    token: string;
    sender: string;
    value: number;
    status: number;
    status_string: string;
    comment: string;
    fee: number;
    txId: string;
    income: boolean;
    kernel: string;
}
