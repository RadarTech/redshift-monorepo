import {
  IRpcClient,
  JsonRpc,
  Network,
  NetworkError,
  RpcConnectionConfig,
  Subnet,
} from '@radar/redshift-types';
import axios, { AxiosInstance } from 'axios';
import BigNumber from 'bignumber.js';
import http from 'http';
import https from 'https';
import { format } from '../helpers/format';

export abstract class BaseRpcClient implements IRpcClient {
  protected _network: Network;
  protected _subnet: Subnet;
  protected _connectionConfig: RpcConnectionConfig;
  private _clientInstancesCache: { [index: string]: AxiosInstance } = {};

  abstract async getBlockCount(): Promise<number>;
  abstract async getBestBlockHash(): Promise<string>;
  abstract async getBalance(address: string): Promise<BigNumber>;
  abstract async sendRawTransaction(txHex: string): Promise<any>;
  abstract async getFeeEstimate(): Promise<BigNumber>;

  /**
   * Instantiate a new rpc client
   * @param network The rpc client network
   * @param subnet The rpc client subnet
   */
  constructor(
    network: Network,
    subnet: Subnet,
    connectionConfig: RpcConnectionConfig,
  ) {
    this._network = network;
    this._subnet = subnet;
    this._connectionConfig = connectionConfig;
  }

  /**
   * Make a JSON RPC call against a client or service provider
   * @param command Target command for this call
   * @param params Parameters for this call
   * @param timeout Optional timeout for this call
   */
  protected async postRpcCall(
    command: string,
    params: any,
    timeout = 1000,
  ): Promise<any> {
    const url = format.toUrl(this._connectionConfig);
    const data: JsonRpc.Request = {
      params,
      id: 1,
      jsonrpc: !!this._connectionConfig.port ? '1.0' : '2.0',
      method: command,
    };

    this._clientInstancesCache[url] =
      this._clientInstancesCache[url] ||
      axios.create({
        baseURL: url,
        headers: {
          'Content-Length': JSON.stringify(data).length,
          'Content-Type': 'application/json',
        },
        httpAgent: new http.Agent({ keepAlive: true }),
        httpsAgent: new https.Agent({
          keepAlive: true,
          ecdhCurve: 'auto',
          rejectUnauthorized: false,
        }),
        method: 'post',
      });

    // Create auth payload if configured
    let auth: { username: string; password: string } | undefined = undefined;
    if (this._connectionConfig.username && this._connectionConfig.password) {
      auth = {
        username: this._connectionConfig.username,
        password: this._connectionConfig.password,
      };
    }

    try {
      const resp = await this._clientInstancesCache[url].request({
        data,
        timeout,
        auth,
      });
      if (resp.data.error) {
        throw new Error(resp.data.error.message);
      }
      return resp.data.result;
    } catch (error) {
      throw new Error(`${NetworkError.RPC_CALL_FAILED}: ${error.message}`);
    }
  }
}
