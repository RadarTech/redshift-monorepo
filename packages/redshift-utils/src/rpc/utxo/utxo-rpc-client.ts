import {
  BlockResult,
  Network,
  RpcConnectionConfig,
  Subnet,
} from '@radar/redshift-types';
import BigNumber from 'bignumber.js';
import { toSatoshi } from 'satoshi-bitcoin-ts';
import { BaseRpcClient } from '../base-rpc-client';

export class UtxoRpcClient extends BaseRpcClient {
  /**
   * Instantiate a new utxo rpc client
   * @param connectionConfig The rpc connection configuration
   */
  constructor(connectionConfig: RpcConnectionConfig) {
    super(connectionConfig);
  }

  /**
   * Fetch current chain block height
   */
  public async getBlockCount(): Promise<number> {
    return this.postRpcCall('getblockcount', []);
  }

  /**
   * Get the header hash of a block at the given height
   * @param height A block height
   */
  public async getBlockHash(height: number): Promise<string> {
    return this.postRpcCall('getblockhash', [height]);
  }

  /**
   * Fetch current chain tip block hash
   */
  public async getBestBlockHash(): Promise<string> {
    return this.postRpcCall('getbestblockhash', []);
  }

  /**
   * Fetch full block data
   * @param hash Block hash to return data for
   * @param returnDecoded If true, return human readable output, else hex data
   */
  async getBlockByHash(
    hash: string,
    returnDecoded: boolean = true,
  ): Promise<BlockResult | string> {
    return this.postRpcCall('getblock', [hash, returnDecoded]);
  }

  /**
   * Get details about a transaction output
   * @param txId The tx id of the transaction containing the output to get
   * @param vout The output index number
   */
  async getTxOutput(txId: string, vout: number): Promise<any> {
    return this.postRpcCall('gettxout', [txId, vout]);
  }

  /**
   * Fetch raw transaction data
   * @param hash The tx hash to return data for
   * @param returnDecoded If true, return human readable output, else hex data
   */
  public async getTransactionByHash(
    hash: string,
    returnDecoded: boolean = true,
  ): Promise<string | any> {
    return this.postRpcCall('getrawtransaction', [hash, returnDecoded ? 1 : 0]);
  }

  /**
   * Broadcast transaction
   * @param txHex Hex string representation of the transaction
   */
  public async sendRawTransaction(txHex: string): Promise<any> {
    return this.postRpcCall('sendrawtransaction', [txHex]);
  }

  public async getBalance(_address: string): Promise<BigNumber> {
    throw new Error('not implemented');
  }

  /**
   * Estimates the transaction fee per kilobyte that needs to be paid
   * for a transaction to be included within a certain number of blocks.
   * Note: btcd must use this method as estimatesmartfee is not supported yet.
   * https://github.com/btcsuite/btcd/issues/1146
   * @param nBlocks How many blocks the transaction may wait before being included
   */
  public async estimateFee(nBlocks: number = 1): Promise<number> {
    return this.postRpcCall('estimatefee', [nBlocks]);
  }

  /**
   * Returns the estimated fee per kb in satoshis
   */
  public async getFeeEstimate(): Promise<BigNumber> {
    const bytesPerKb = 1000;
    const fee = await this.estimateFee();
    return new BigNumber(String(Math.ceil(toSatoshi(fee / bytesPerKb))));
  }

  /**
   * Estimates the transaction fee per kilobyte that needs to be paid
   * for a transaction to be included within a certain number of blocks.
   * Use this method over estimatefee if possible. It returns more intelligent estimates.
   * @param nBlocks How many blocks the transaction may wait before being included
   */
  public async estimateSmartFee(nBlocks: number): Promise<any> {
    const result = await this.postRpcCall('estimatesmartfee', [nBlocks]);
    return result && result.feerate;
  }
}
