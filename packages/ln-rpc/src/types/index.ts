export interface LnRpcClientConfig {
  server: string; // URL for the lightning node to connect to ie. localhost:10009
  tls: string; // /path/to/tls.cert
  cert: string; // string representation of tls.cert
  macaroonPath: string;
  macaroon: string; // hex-encoded string of macaroon file
}

export interface GetInfoResponse {
  identify_pubkey: string;
  alias?: string;
  num_pending_channels?: number;
  num_active_channels?: number;
  num_peers: number;
  block_height: string;
  block_hash: string;
  synced_to_chain: boolean;
  testnet: boolean;
  chains: string[];
  uris?: string[];
  best_header_timestamp: Long;
  version: string;
  num_inactive_channels: number;
}

export interface PayReqString {
  pay_req: string;
}

export interface HopHint {
  node_id: string;
  chain_id?: Long;
  fee_base_msat?: number;
  fee_proportional_millionths?: number;
  cltv_expiry_delta?: number;
}

export interface RouteHint {
  hop_hints: HopHint[];
}

export interface PayReq {
  destination: string;
  payment_hash: string;
  num_satoshis: Long;
  timestamp: Long;
  expiry: Long;
  description?: string;
  description_hash?: string;
  fallback_addr?: string;
  cltv_expiry?: Long;
  route_hints?: RouteHint[];
}

export interface PaymentHash {
  r_hash_str: string; // hex-encoded 32 bytes
  r_hash: Int8Array;
}

export interface Peer {
  pub_key: string;
  address?: string;
  bytes_sent?: Long;
  bytes_recv?: Long;
  sat_sent?: Long;
  sat_recv?: Long;
  inbound?: boolean;
  ping_time?: Long;
}

export interface ListPeersResponse {
  peers: Peer[];
}
