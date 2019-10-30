import {
  OffChainTicker,
  OnChainTicker,
  RpcConnectionConfig,
} from '@radar/redshift-types';
import crypto from 'crypto';
import hexToUuid from 'hex-to-uuid';
import { isString } from 'value-utils';
import Web3 from 'web3';

export const format = {
  /**
   * Strip the hex prefix from the passed string if it exists
   * @param hex The hex string
   */
  stripHexPrefix(hex: string) {
    if (!isString(hex)) {
      return hex;
    }
    return hex.replace(/^(0x|0X)/, '');
  },
  /**
   * Format the invoice hash in a standard way
   * @param hash The hash to format
   */
  invoiceHash(hash: string) {
    if (!isString(hash)) {
      return hash;
    }
    return format.stripHexPrefix(hash).toLowerCase();
  },
  /**
   * Format the ticker in a standard way
   * @param ticker The ticker to format
   */
  ticker<T extends OnChainTicker | OffChainTicker>(ticker: T) {
    if (!ticker) {
      return ticker;
    }
    return ticker.toUpperCase() as T;
  },
  /**
   * Format the invoice hash in a standard way
   * @param uuid The uuid to format
   */
  uuid(uuid: string) {
    if (!isString(uuid)) {
      return uuid;
    }
    if (Web3.utils.isHex(uuid)) {
      return hexToUuid(uuid);
    }
    return uuid.toLowerCase();
  },
  /**
   * Return the SHA256 hash of an invoice
   * @param invoice The invoice to hash
   */
  hashInvoice(invoice: string) {
    return crypto
      .createHash('sha256')
      .update(invoice)
      .digest('hex');
  },
  /**
   * Reverse the byte order (endianness) of a buffer or hex string.
   * @param arg The buffer or hex string to reverse
   * @returns A buffer with the reversed bytes
   */
  toReversedByteOrderBuffer(arg: Buffer | string) {
    let buffer = arg as Buffer;
    if (typeof arg === 'string') {
      buffer = Buffer.from(arg as string, 'hex');
    }
    return Buffer.from(Buffer.from(buffer).reverse());
  },
  /**
   * Return the formatted URL from an connection config
   * @param config The `RpcConnectionConfig` config
   */
  toUrl(config: RpcConnectionConfig) {
    const protocol = config.https ? 'https' : 'http';
    const uri = !!config.port ? `${config.host}:${config.port}` : config.host;
    return `${protocol}://${uri}`;
  },
};
