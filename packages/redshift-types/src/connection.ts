export interface RpcConnectionConfig {
  host: string;
  port: number;
  path: string;
  username: string;
  password: string;
  https: boolean;
  maxReconnectionDelay?: number;
  minReconnectionDelay?: number;
  reconnectionDelayGrowFactor?: number;
  debug?: boolean;
}

export namespace JsonRpc {
  /**
   * Request object representation of a rpc call.
   * Server always replies with a Response object having the same id.
   */
  export interface Request extends Notification {
    /** An identifier established by the Client */
    id: number;
  }

  /**
   * Client can send a request with no expectation of a response.
   * Server can send a notification without an explicit request by a client.
   */
  export interface Notification {
    /** Name of the method to be invoked. */
    method: string;
    /** Parameter values to be used during the invocation of the method. */
    params?: any;
    /** Version of the JSON-RPC protocol. */
    jsonrpc?: '1.0' | '2.0';
  }

  /**
   * Response object representation of a rpc call.
   * Response will always contain a result property unless an error occured.
   * In which case, an error property is present.
   */
  export interface Response {
    /** An identifier established by the Client. */
    id: number;
    /** Result object from the Server if method invocation was successful. */
    result?: any;
    /** Error object from Server if method invocation resulted in an error. */
    error?: Error;
    /** Version of the JSON-RPC protocol. */
    jsonrpc?: '1.0' | '2.0';
  }
}
