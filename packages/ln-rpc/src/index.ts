import createLnRpc from 'lnrpc';
import {
  GetInfoResponse,
  ListPeersResponse,
  LnRpcClientConfig,
  PayReq,
  PayReqString,
} from './types';

export class LnRpcClient {
  private lnRpcClientInstance: any;

  constructor(lnRpcClientInstance: any) {
    this.lnRpcClientInstance = lnRpcClientInstance;
  }

  public static async createInstance(
    lnRpcClientConfig: LnRpcClientConfig,
  ): Promise<LnRpcClient> {
    return new LnRpcClient(await createLnRpc(lnRpcClientConfig));
  }

  public async getInfo(): Promise<GetInfoResponse> {
    return <GetInfoResponse>this.lnRpcClientInstance.getInfo({});
  }

  public async decodePayReq(params: PayReqString): Promise<PayReq> {
    return <PayReq>this.lnRpcClientInstance.decodePayReq(params);
  }

  public async listPeers(): Promise<ListPeersResponse> {
    return <ListPeersResponse>this.lnRpcClientInstance.listPeers();
  }
}
