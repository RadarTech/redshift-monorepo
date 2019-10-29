import { Network, Subnet } from '@radar/redshift-types';
import { getRpcConnectionConfig } from '@radar/redshift-utils';

export function getRpcUrl(network: Network, subnet: Subnet): string {
  const { host, port } = getRpcConnectionConfig(network, subnet);
  return `http://${host}:${port}`;
}

export function getTestingMnemonic() {
  return process.env.REDSHIFT_TESTING_MNEMONIC as string;
}
