export enum TableTypes {
    TRANSACTIONS = 'wallet',
    ADDRESSES = 'addresses',
    CONTACTS = 'contacts',
    UTXO = 'utxo',
    TRANSACTIONS_NOT_SENT = 'wallet_not_sent'
}

export enum globalConsts {
    GROTHS_IN_BEAM = 100000000,
    MIN_FEE_VALUE = 100,
    MAX_FEE_VALUE = 1000000000,
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
    CANCELED = 'cancelled',
    EXPIRED = 'expired',
    FAILED = 'failed',
    SELF_SENDING = 'self sending',
    COMPLETED = 'completed',
    SENDING_TO_OWN_ADDRESS = 'sending to own address',
    SENT_TO_OWN_ADDRESS = 'sent to own address',
}

export enum utxoStatuses {
    INCOMING = 'incoming',
    OUTGOING = 'outgoing',
    AVAILABLE = 'available',
    UNAVAILABLE = 'unavailable',
    IN_PROGRESS = 'in progress',
    SPENT = 'spent'
}

export enum statusesColors {
    SELF_SENDING = '#ffffff',
    FAILED = '#ff746b',
    CANCELED = '#8da1ad',
    SEND = '#da68f5',
    RECEIVE = '#23c1ff'
}
