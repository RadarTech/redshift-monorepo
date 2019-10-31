import { Network, RpcConnectionConfig, Subnet } from '@radar/redshift-types';
import BigNumber from 'bignumber.js';
import { Tx } from 'web3/eth/types';
import { hexToBigNumber } from '../../helpers/numeric';
import { BaseRpcClient } from '../base-rpc-client';

export class EthereumRpcClient extends BaseRpcClient {
  /**
   * Instantiate a new ethereum rpc client
   * @param connectionConfig The rpc connection configuration
   */
  constructor(connectionConfig: RpcConnectionConfig) {
    super(connectionConfig);
  }

  /**
   * Fetch current chain block height
   */
  public async getBlockCount(): Promise<number> {
    const result = await this.postRpcCall('eth_blockNumber', []);
    return result && parseInt(result, 16);
  }

  /**
   * Fetch current chain tip block hash
   */
  public async getBestBlockHash(): Promise<string> {
    const result = await this.postRpcCall('eth_getBlockByNumber', [
      'latest',
      false,
    ]);
    return result && result.hash;
  }

  /**
   * Fetch raw transaction data
   * @param hash Tx hash to return data for
   */
  public async getTransactionByHash(hash: string): Promise<string> {
    return this.postRpcCall('eth_getTransactionByHash', [hash]);
  }

  /**
   * Fetch full block data
   * @param hash Block hash to return data for
   * @param returnObjects If true, return transaction objects, else return tx hashes
   */
  public async getBlockByHash(
    hash: string,
    returnObjects: boolean = true,
  ): Promise<any> {
    return this.postRpcCall('eth_getBlockByHash', [hash, returnObjects]);
  }

  /**
   * Broadcast transaction
   * @param txHex Hex string representation of the transaction
   */
  public async sendRawTransaction(txHex: string): Promise<any> {
    return this.postRpcCall('eth_sendRawTransaction', [txHex]);
  }

  /**
   * Generates and returns an estimate of how much gas is necessary to allow the transaction to complete.
   * Value is returned in hex format.
   * @param tx The partially filled tx params
   */
  public async estimateGas(tx: Tx): Promise<string> {
    return this.postRpcCall('eth_estimateGas', [tx]);
  }

  /**
   * Returns the current price per gas in wei.
   * Value is returned in hex format.
   */
  public async gasPrice(): Promise<string> {
    return this.postRpcCall('eth_gasPrice', []);
  }

  /**
   * Fetch balance of an address
   * @param address Address of balance to check
   */
  public async getBalance(address: string): Promise<BigNumber> {
    const resultHex = await this.postRpcCall('eth_getBalance', [
      address,
      'latest',
    ]);
    return hexToBigNumber(resultHex);
  }

  /**
   * Returns the estimated suggested gas price in wei
   */
  public async getFeeEstimate(): Promise<BigNumber> {
    return hexToBigNumber(await this.gasPrice());
  }
}
