import { BigNumber } from 'bignumber.js';

export interface IRpcClient {
  /** Fetch known block height */
  getBlockCount(): Promise<number>;

  /** Fetch latest known block hash */
  getBestBlockHash(): Promise<string>;

  /**
   * Fetch chain balance of an address
   * @param address Address balance to fetch
   */
  getBalance(address: string): Promise<BigNumber>;

  /**
   * Broadcast a transaction
   * @param Hex string representation of the transaction
   */
  sendRawTransaction(txHex: string): Promise<any>;

  /**
   * Fetch a fee estimate for submitting transactions to a respective network
   * NOTE: the data returned is contextual to the network
   */
  getFeeEstimate(): Promise<BigNumber>;
}
