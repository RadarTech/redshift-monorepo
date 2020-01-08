import { KnownKeys, ValueOf } from '../lib';

// tslint:disable:variable-name

/**
 * The swap order state
 */
export enum InternalSwapState {
  WAITING_FOR_FUNDING_TX = 'WaitingForFundingTx',
  WAITING_FOR_FUNDING_TX_CONFIRMATION = 'WaitingForFundingTxConfirmation',
  WAITING_FOR_ADDITIONAL_FUNDING_TX_CONFIRMATION = 'WaitingForAdditionalFundingTxConfirmation',
  PARTIALLY_FUNDED = 'PartiallyFunded',
  FUNDED = 'Funded',

  WAITING_FOR_CLAIMING_TX = 'WaitingForClaimingTx',
  WAITING_FOR_CLAIMING_TX_CONFIRMATION = 'WaitingForClaimingTxConfirmation',
  COMPLETE = 'Complete', // On-chain funds have been claimed

  WAITING_FOR_REFUND_TX = 'WaitingForRefundTx',
  ADDRESS_BLACKLISTED_WAITING_FOR_REFUND_TX = 'AddressBlacklistedWaitingForRefundTx',
  WAITING_FOR_REFUND_TX_CONFIRMATION = 'WaitingForRefundTxConfirmation',
  REFUNDED = 'Refunded',

  FUND_WINDOW_ELAPSED = 'FundWindowElapsed', // The fund window has elapsed
  RECEIVED_NO_QUOTES = 'ReceivedNoQuotes', // No quotes were received for the order
}

/**
 * The swap order state that concerns the user
 */
export enum UserSwapState {
  WAITING_FOR_FUNDING_TX = 'WaitingForFundingTx',
  WAITING_FOR_FUNDING_TX_CONFIRMATION = 'WaitingForFundingTxConfirmation',
  WAITING_FOR_ADDITIONAL_FUNDING_TX_CONFIRMATION = 'WaitingForAdditionalFundingTxConfirmation',
  PARTIALLY_FUNDED = 'PartiallyFunded',
  FUNDED = 'Funded',

  COMPLETE = 'Complete', // Invoice has been paid

  WAITING_FOR_REFUND_TX = 'WaitingForRefundTx',
  ADDRESS_BLACKLISTED_WAITING_FOR_REFUND_TX = 'AddressBlacklistedWaitingForRefundTx',
  WAITING_FOR_REFUND_TX_CONFIRMATION = 'WaitingForRefundTxConfirmation',
  REFUNDED = 'Refunded',

  FUND_WINDOW_ELAPSED = 'FundWindowElapsed', // The fund window has elapsed
}

/**
 * Payment Failed Reasons types
 * Used to differentiate between a can't pay because of a blacklisted sender address (did not even tried to pay)
 * and other reasons generally technical like can't route the payment, etc
 */
export enum PaymentFailedReason {
  ADDRESS_BLACKLISTED = 'AddressBlacklisted',
  PAYMENT_FAILED = 'PaymentFailed',
}

/**
 * Internal swap transaction types
 */
export enum InternalTransactionType {
  FUND = 'FUND',
  CLAIM = 'CLAIM',
  REFUND = 'REFUND',
}

/**
 * Swap transaction types that concern the user
 */
export enum UserTransactionType {
  FUND = 'FUND',
  REFUND = 'REFUND',
}

/**
 * Ticker symbols for supported simnet on-chain assets (testing only)
 */
export enum SimnetOnChainTicker {
  SBTC = 'SBTC', // Simnet Bitcoin
  SETH = 'SETH', // Simnet Ether
  SLTC = 'SLTC', // Simnet Litecoin
  SDAI = 'SDAI', // Simnet DAI
  SXLM = 'SXLM', // Simnet Stellar Lumens
  SDCR = 'SDCR', // Simnet Decred
  SUSDC = 'SUSDC', // Simnet USDC
  SZRX = 'SZRX', // Simnet ZRX
  SWETH = 'SWETH', // Simnet WETH (wrapped ETH)
}

/**
 * Ticker symbols for supported testnet on-chain assets (live and potential)
 */
export enum TestnetOnChainTicker {
  TBTC = 'TBTC', // Testnet Bitcoin
  KETH = 'KETH', // Kovan Testnet Ether
  TLTC = 'TLTC', // Testnet Litecoin
  KDAI = 'KDAI', // Kovan Testnet DAI
  TXLM = 'TXLM', // Testnet Stellar Lumens
  TDCR = 'TDCR', // Testnet Decred
  KUSDC = 'KUSDC', // Kovan Testnet USDC
  KZRX = 'KZRX', // Kovan ZRX
  KWETH = 'KWETH', // Kovan Testnet WETH (wrapped ETH)
}

/**
 * Ticker symbols for supported mainnet on-chain assets (live and potential)
 */
export enum MainnetOnChainTicker {
  BTC = 'BTC', // Bitcoin
  ETH = 'ETH', // Ether
  LTC = 'LTC', // Litecoin
  DAI = 'DAI', // DAI
  XLM = 'XLM', // Stellar Lumens
  DCR = 'DCR', // Decred
  USDC = 'USDC', // USDC
  ZRX = 'ZRX', // ZRX
  WETH = 'WETH', // WETH (wrapped ETH)
}

/**
 * Ticker symbols for supported on-chain assets (live and potential)
 */
export const OnChainTicker = {
  ...SimnetOnChainTicker,
  ...TestnetOnChainTicker,
  ...MainnetOnChainTicker,
};
export type OnChainTicker = ValueOf<
  Pick<typeof OnChainTicker, KnownKeys<typeof OnChainTicker>>
>;

/**
 * Ticker symbols for simnet off-chain assets (testing only)
 */
export enum SimnetOffChainTicker {
  LSBTC = 'LSBTC', // Lightning Simnet Bitcoin
  LSLTC = 'LSLTC', // Lightning Simnet Litecoin
}

/**
 * Ticker symbols for supported testnet off-chain assets (live and potential)
 */
export enum TestnetOffChainTicker {
  LTBTC = 'LTBTC', // Lightning Testnet Bitcoin
  LTLTC = 'LTLTC', // Lightning Testnet Litecoin
}

/**
 * Ticker symbols for supported mainnet off-chain assets (live and potential)
 */
export enum MainnetOffChainTicker {
  LBTC = 'LBTC', // Lightning Bitcoin
  LLTC = 'LLTC', // Lightning Litecoin
}

/**
 * Ticker symbols for supported off-chain assets (live and potential)
 */
export const OffChainTicker = {
  ...SimnetOffChainTicker,
  ...TestnetOffChainTicker,
  ...MainnetOffChainTicker,
};
export type OffChainTicker = ValueOf<
  Pick<typeof OffChainTicker, KnownKeys<typeof OffChainTicker>>
>;

/**
 * Supported Simnet Markets (testing only)
 */
export enum SimnetMarket {
  SBTC_LSBTC = 'SBTC_LSBTC',
  SETH_LSBTC = 'SETH_LSBTC',
  SLTC_LSBTC = 'SLTC_LSBTC',
  SDAI_LSBTC = 'SDAI_LSBTC',
  SXLM_LSBTC = 'SXLM_LSBTC',
  SDCR_LSBTC = 'SDCR_LSBTC',
  SUSDC_LSBTC = 'SUSDC_LSBTC',
  SZRX_SWETH = 'SZRX_SWETH',
  SWETH_SDAI = 'SWETH_SDAI',
  SWETH_SUSDC = 'SWETH_SUSDC',
}

/**
 * Supported Testnet Markets (live and potential)
 */
export enum TestnetMarket {
  TBTC_LTBTC = 'TBTC_LTBTC',
  KETH_LTBTC = 'KETH_LTBTC',
  TLTC_LTBTC = 'TLTC_LTBTC',
  KDAI_LTBTC = 'KDAI_LTBTC',
  TXLM_LTBTC = 'TXLM_LTBTC',
  TDCR_LTBTC = 'TDCR_LTBTC',
  KUSDC_LTBTC = 'KUSDC_LTBTC',
  KZRX_KWETH = 'KZRX_KWETH',
  KWETH_KDAI = 'KWETH_KDAI',
  KWETH_KUSDC = 'KWETH_KUSDC',
}

/**
 * Supported Mainnet Markets (live and potential)
 */
export enum MainnetMarket {
  BTC_LBTC = 'BTC_LBTC',
  ETH_LBTC = 'ETH_LBTC',
  LTC_LBTC = 'LTC_LBTC',
  DAI_LBTC = 'DAI_LBTC',
  XLM_LBTC = 'XLM_LBTC',
  DCR_LBTC = 'DCR_LBTC',
  USDC_LBTC = 'USDC_LBTC',
  ZRX_WETH = 'ZRX_WETH',
  WETH_DAI = 'WETH_DAI',
  WETH_USDC = 'WETH_USDC',
}

/**
 * Supported Markets (live and potential)
 */
export const Market = {
  ...SimnetMarket,
  ...TestnetMarket,
  ...MainnetMarket,
};
export type Market = ValueOf<Pick<typeof Market, KnownKeys<typeof Market>>>;

export namespace Ws {
  /**
   * Liquidity provider event names
   */
  enum LiquidityProviderEvent {
    // REDSHIFT
    AUTHENTICATE = 'authenticate',
    SUBSCRIBE_TO_QUOTES = 'subscribeToQuotes',
    UNSUBSCRIBE_FROM_QUOTES = 'unsubscribeFromQuotes',
    MAKER_QUOTE = 'makerQuote',
    PAYMENT_RESULT = 'paymentResult',
    ACTIVE_CONFIGURATION = 'activeConfiguration',
    // LIQUIDITY PROVIDER
    REQUEST_QUOTE = 'requestQuote',
  }

  /**
   * User websocket event names
   */
  enum UserEvent {
    // SERVER
    REQUEST_QUOTE = 'requestQuote',
    SUBSCRIBE_TO_ORDER_STATE = 'subscribeToOrderState',
    UNSUBSCRIBE_FROM_ORDER_STATE = 'unsubscribeFromOrderState',
    SUBSCRIBE_TO_BLOCK_HEIGHT = 'subscribeToBlockHeight',
    UNSUBSCRIBE_FROM_BLOCK_HEIGHT = 'unsubscribeFromBlockHeight',
    BROADCAST_TRANSACTION = 'broadcastTransaction',
    REQUEST_REFUND_DETAILS = 'requestRefundDetails',
    REQUEST_MARKET_REQUIREMENTS = 'requestMarketRequirements',
    // CLIENT
    MAKER_QUOTE = 'makerQuote',
    STATE_CHANGED = 'stateChanged',
    BLOCK_HEIGHT_CHANGED = 'blockHeightChanged',
  }

  /**
   * WebSocket namespaces
   */
  export enum Namespace {
    PROVIDER_V1 = '/provider/v1',
    USER_V1 = '/user/v1',
  }

  /**
   * WebSocket event names
   */
  // tslint:disable-next-line: variable-name
  export const Event = {
    ...LiquidityProviderEvent,
    ...UserEvent,
  };
}

/**
 * WebSocket success states
 */
export enum WebSocketSuccess {
  SOCKET_CONNECTED = 'SocketConnected',
}
