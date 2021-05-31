export enum TableTypes {
    TRANSACTIONS = 'wallet',
    ADDRESSES = 'addresses',
    CONTACTS = 'contacts',
    UTXO = 'utxo',
    TRANSACTIONS_NOT_SENT = 'wallet_not_sent'
}

export enum globalConsts {
    GROTHS_IN_BEAM = 100000000,
    MIN_FEE_VALUE = 100000,
    MIN_OFFLINE_FEE_VALUE = 110000,
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

export enum rpcMethodIdsConsts {
    TX_LIST_ID = 6,
    GET_UTXO_ID = 7,
    ADDR_LIST_ID = 8,
    CREATE_ADDRESS_ID = 'create_address',
    WALLET_STATUS_ID = 'wallet_status',
    TX_SEND_ID = 11,
    TX_CANCEL_ID = 15,
    CHANGE_PASSWORD_ID = 16,
    CALC_CHANGE_ID = 'calc_change',
    TX_DELETE_ID = 18,
    EXPORT_PAYMENT_PROOF_ID = 25,
    VERIFY_PAYMENT_PROOF_ID = 26,
    VALIDATE_ADDRESS = 'validate_address',
    GET_ASSET_INFO = 'get_asset_info'
}

export enum assetPropertiesConsts {
    ASSET_NAME = 'N=',
    SHORT_NAME = 'SN=',
    UNIT_NAME = 'UN=',
    SMALLET_UNIT_NAME = 'NTHUN=',
    RATIO = 'NTHUN=',
    SHORT_DESC = 'OPT_SHORT_DESC=',
    LONG_DESC = 'OPT_LONG_DESC=',
    SITE_URL = 'OPT_SITE_URL=',
    PDF_URL = 'OPT_PDF_URL=',
    FAVICON_URL = 'OPT_FAVICON_URL=',
    LOGO_URL = 'OPT_LOGO_URL=',
    COLOR = 'OPT_COLOR='
}

export enum transactionTypes {
    regular = 'Regular',
    maxPrivacy = 'Max Privacy',
    offline = 'Offline'
}