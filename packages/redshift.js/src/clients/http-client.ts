import {
  ApiError,
  FundDetails,
  MarketsResponse,
  OnChainTicker,
  OrderDetailsResponse,
  OrdersResponse,
  RefundDetails,
  RefundDetailsResponse,
  TransactionsResponse,
  UserSwapState,
} from '@radar/redshift-types';
import axios from 'axios';
import sha256 from 'simple-sha256';
import { config } from '../config';
import { utils } from '../utils';

export class HttpClient {
  private _apiBase: string;

  /**
   * Instantiate the HTTP client
   * @param url The redshift API url without the path
   */
  constructor(url: string = config.url) {
    this._apiBase = `${url}/api`;
  }

  /**
   * Get the active markets
   */
  public async getMarkets(): Promise<MarketsResponse> {
    const json = await axios.get<MarketsResponse>(`${this._apiBase}/markets`);
    return json.data;
  }

  /**
   * Get all general information about all swap orders for a specific invoice
   * @param invoice The invoice that will be payed by the swap provider
   * @param onchainTicker The optional ticker of the on-chain asset used to fund the swap
   */
  public async getOrders(
    invoice: string,
    onchainTicker?: OnChainTicker,
  ): Promise<OrdersResponse> {
    if (!utils.isValidBech32(invoice)) {
      throw new Error(ApiError.INVALID_INVOICE);
    }
    if (onchainTicker && !utils.isValidOnchainTicker(onchainTicker)) {
      throw new Error(ApiError.INVALID_ONCHAIN_TICKER);
    }
    const invoiceHash = await sha256(invoice);
    const json = await axios.get<OrdersResponse>(`${this._apiBase}/orders`, {
      params: {
        invoiceHash,
        onchainTicker,
      },
    });
    return json.data;
  }

  /**
   * Get the details for a single swap order
   * @param orderId The uuid of the order
   */
  public async getOrder(orderId: string): Promise<OrderDetailsResponse> {
    if (!utils.isValidUUID(orderId)) {
      throw new Error(ApiError.INVALID_ORDER_ID);
    }
    const json = await axios.get<OrderDetailsResponse>(
      `${this._apiBase}/orders/${orderId}`,
    );
    return json.data;
  }

  /**
   * Get the state of an order
   * @param orderId The uuid of the order
   */
  public async getOrderState(orderId: string): Promise<UserSwapState> {
    if (!utils.isValidUUID(orderId)) {
      throw new Error(ApiError.INVALID_ORDER_ID);
    }
    const json = await axios.get<UserSwapState>(
      `${this._apiBase}/orders/${orderId}/state`,
    );
    return json.data;
  }

  /**
   * Get the fund details for an order
   * @param orderId The uuid of the order
   */
  public async getOrderFundDetails(orderId: string): Promise<FundDetails> {
    if (!utils.isValidUUID(orderId)) {
      throw new Error(ApiError.INVALID_ORDER_ID);
    }
    const json = await axios.get<FundDetails>(
      `${this._apiBase}/orders/${orderId}/fundDetails`,
    );
    return json.data;
  }

  /**
   * Get the transactions relating to an order
   * @param orderId The uuid of the order
   */
  public async getOrderTransactions(
    orderId: string,
  ): Promise<TransactionsResponse> {
    if (!utils.isValidUUID(orderId)) {
      throw new Error(ApiError.INVALID_ORDER_ID);
    }
    const json = await axios.get<TransactionsResponse>(
      `${this._apiBase}/orders/${orderId}/transactions`,
    );
    return json.data;
  }

  /**
   * Get the refund details for an order
   * @param orderId The uuid of the order
   */
  public async getOrderRefundDetails<D extends RefundDetails = RefundDetails>(
    orderId: string,
  ): Promise<RefundDetailsResponse<D>> {
    if (!utils.isValidUUID(orderId)) {
      throw new Error(ApiError.INVALID_ORDER_ID);
    }
    const json = await axios.get<RefundDetailsResponse<D>>(
      `${this._apiBase}/orders/${orderId}/refund`,
    );
    return json.data;
  }
}
