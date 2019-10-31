import { Network, RpcConnectionConfig, Subnet } from '@radar/redshift-types';

const credentialsCache: { [network: string]: RpcConnectionConfig } = {};

/**
 * Get the rpc connection configuration for the passed network & subnet
 * @param network The rpc connection network
 * @param subnet The rpc connection subnet
 */
export function getRpcConnectionConfig(
  network: Network,
  subnet: Subnet,
): RpcConnectionConfig {
  const networkKey = network.toUpperCase();
  const subnetKey = subnet.toUpperCase();
  credentialsCache[network] = credentialsCache[network] || {
    host: process.env[`REDSHIFT_CHAIN_${networkKey}_${subnetKey}_RPC_HOST`],
    password:
      process.env[`REDSHIFT_CHAIN_${networkKey}_${subnetKey}_RPC_PASSWORD`],
    port: Number(
      process.env[`REDSHIFT_CHAIN_${networkKey}_${subnetKey}_RPC_PORT`],
    ),
    path: process.env[`REDSHIFT_CHAIN_${networkKey}_${subnetKey}_RPC_PATH`],
    username:
      process.env[`REDSHIFT_CHAIN_${networkKey}_${subnetKey}_RPC_USERNAME`],
    https:
      process.env[`REDSHIFT_CHAIN_${networkKey}_${subnetKey}_RPC_USE_HTTPS`] ===
      'true',
  };
  return credentialsCache[network];
}
