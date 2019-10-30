import axios, { AxiosInstance } from 'axios';
import http from 'http';
import https from 'https';

import {
  JsonRpc,
  Network,
  NetworkError,
  RpcConnectionConfig,
  Subnet,
} from '@radar/redshift-types';
import { getRpcConnectionConfig } from './rpc-config';

const clientInstancesCache: { [index: string]: AxiosInstance } = {};

/**
 *
 * Make a JSON RPC call
 *
 * @param {String} network - target network daemon for this call
 * @param {String} command - target command for this call
 * @param [Object] params - parameters for this call
 * @throws {Error} if call fails
 * @return <Result Object>
 */
export async function postRpcCall(
  network: Network,
  subnet: Subnet,
  command: string,
  params: any,
  timeout = 1000,
): Promise<any> {
  const connectionConfig: RpcConnectionConfig = getRpcConnectionConfig(
    network,
    subnet,
  );
  const uri = `${connectionConfig.host}:${connectionConfig.port}`;
  const protocol = connectionConfig.https ? 'https' : 'http';
  const data: JsonRpc.Request = {
    params,
    id: 1,
    jsonrpc: '1.0',
    method: command,
  };

  clientInstancesCache[uri] =
    clientInstancesCache[uri] ||
    axios.create({
      baseURL: `${protocol}://${uri}/`,
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
      url: '/',
    });

  try {
    const resp = await clientInstancesCache[uri].request({
      data,
      timeout,
      auth: {
        password: `${connectionConfig.password}`,
        username: `${connectionConfig.username}`,
      },
    });
    if (resp.data.error) {
      throw new Error(resp.data.error.message);
    }
    return resp.data.result;
  } catch (error) {
    throw new Error(`${NetworkError.RPC_CALL_FAILED}:${error}`);
  }
}
