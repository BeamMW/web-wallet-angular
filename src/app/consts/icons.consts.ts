import { environment } from '@environment';
const basePath: string = `${environment.assetsPath}`;

export const ICONS_MAIN = {
    ICON_BEAM: basePath + `/images/modules/wallet/containers/main/ic-beam.svg`,
    ICON_BEAM_FULL: basePath + `/images/modules/wallet/containers/main/icon-beam-full.svg`,
    ICON_RECEIVED: basePath + `/images/modules/wallet/containers/main/icon-received.svg`,
    ICON_SENT: basePath + `/images/modules/wallet/containers/main/icon-sent.svg`,
    ICON_MENU: basePath + `/images/modules/wallet/containers/main/icon-menu.svg`,
    ICON_EMPTY: basePath + `/images/modules/wallet/containers/main/atomic-empty-state.svg`,
    ICON_DISABLED_PRIVACY: basePath + `/images/modules/wallet/containers/main/icn-eye.svg`,
    ICON_ENABLED_PRIVACY: basePath + `/images/modules/wallet/containers/main/icn-eye-crossed.svg`,
    ICON_ENABLED_PRIVACY_GR: basePath + `/images/modules/wallet/containers/main/icn-eye-crossed-gray.svg`,
    ICON_EMPTY_TRANSACTIONS: basePath + `/images/modules/wallet/containers/main/icon-wallet.svg`,
    ICON_GET_COINS_BUTTON: basePath + `/images/modules/wallet/containers/main/icon-receive-blue.svg`,
    ICON_COMMENT: basePath + `/images/modules/addresses/components/address-element/icon-comment.svg`,
    ICON_CLOSE: basePath + `/images/modules/receive/components/qr-popup/ic-cancel.svg`
};
