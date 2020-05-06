export enum TableTypes {
    TRANSACTIONS = 'wallet',
    ADDRESSES = 'addresses',
    CONTACTS = 'contacts',
    UTXO = 'utxo',
    TRANSACTIONS_NOT_SENT = 'wallet_not_sent'
}

export enum GlobalConsts {
    GROTHS_IN_BEAM = 100000000,
}

export enum transactionsStatuses {
    IN_PROGRESS = 'in progress',
    PENDING = 'pending',
    SENDING = 'sending',
    WAITING_FOR_RECEIVER = 'waiting for receiver',
    WAITING_FOR_SENDER = 'waiting for sender',
    SENT = 'sent',
    RECEIVED = 'received',
    RECEIVING = 'receiving',
    CANCELED = 'canceled',
    EXPIRED = 'expired',
    FAILED = 'failed',
    SENDING_TO_OWN_ADDRESS = 'self sending',
    COMPLETED = 'completed'
}
