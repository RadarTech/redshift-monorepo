import { getRpcConnectionConfig } from '.';
import { Network, Subnet } from '../../../src/types';

export function getRpcWebSocketUrl(network: Network, subnet: Subnet): string {
  const { host, port, path } = getRpcConnectionConfig(network, subnet);
  if (path) {
    return `wss://${host}:${port}/${path}`;
  }
  return `ws://${host}:${port}`;
}