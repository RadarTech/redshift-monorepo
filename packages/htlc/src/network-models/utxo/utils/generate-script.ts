import { SwapError } from '@radar/redshift-types';
import bip65 from 'bip65';
import bip68 from 'bip68';
import { address, crypto, opcodes, script } from 'bitcoinjs-lib';
import varuint from 'varuint-bitcoin';
import { UTXO } from '../../../types';

/**
 * Convert an iterable of script elements to a hex string
 * @param scriptElements An iterable representation of a script
 * @throws On invalid script
 * @return Hex representation of the scriptElements
 */
function convertScriptElementsToHex(scriptElements: any): string {
  return scriptElements
    .map((element: any) => {
      if (Buffer.isBuffer(element)) {
        return Buffer.concat([varuint.encode(element.length), element]);
      }
      return Buffer.from(element.toString(16), 'hex');
    })
    .reduce((element: any, script: any) => Buffer.concat([element, script]))
    .toString('hex');
}

/**
 * Convert a p2pkh or p2wpkh address to a public key hash
 * @param addr The p2pkh or p2wpkh address
 */
function addressToPublicKeyHash(addr: string): string {
  let publicKeyHash;
  try {
    const details = address.fromBase58Check(addr);
    if (details) {
      publicKeyHash = details.hash;
    }
  } catch (err) {}

  try {
    const details = address.fromBech32(addr);
    if (details) {
      publicKeyHash = details.data;
    }
  } catch (err) {}

  if (!publicKeyHash) {
    throw new Error(SwapError.INVALID_REFUND_ADDRESS);
  }
  return publicKeyHash.toString('hex');
}

/**
 * Generate a swap redeem script for a public key hash refund path.
 * Check if the sha256 of the top item of the stack is the payment hash.
 * If true, push the remote pubkey on the stack.
 * If false, check the lock time, pubkey hash, and push the local pubkey.
 * Check remote or local pubkey signed the transaction.
 * @param scriptArgs The script arguements for creating a swap redeem script
 * claimerPublicKey, paymentHash, refundHash, refundAddress, timelock
 * @return The hex representation of the redeem script
 */
export function createSwapRedeemScript(
  scriptArgs: UTXO.RedeemScriptArgs,
): string {
  const refundPublicKeyHash = addressToPublicKeyHash(scriptArgs.refundAddress);
  const [
    claimerPublicKeyBuffer,
    paymentHashBuffer,
    refundPublicKeyHashBuffer,
  ] = [
    scriptArgs.claimerPublicKey,
    scriptArgs.paymentHash,
    refundPublicKeyHash,
  ].map(i => Buffer.from(i, 'hex'));

  let refundHashBuffer;
  let refundHashRipemd160Buffer;
  if (scriptArgs.refundHash) {
    refundHashBuffer = Buffer.from(scriptArgs.refundHash, 'hex');
    refundHashRipemd160Buffer = crypto.ripemd160(refundHashBuffer);
  }

  const paymentHashRipemd160Buffer = crypto.ripemd160(paymentHashBuffer);

  // set the correct timelock values/method for swapScript
  let timelockValue: Buffer;
  let timelockMethod: number;
  if (scriptArgs.timelock.type === UTXO.LockType.RELATIVE) {
    timelockValue = script.number.encode(
      bip68.encode({ blocks: scriptArgs.timelock.blockBuffer }),
    );
    timelockMethod = opcodes.OP_CHECKSEQUENCEVERIFY;
  } else if (scriptArgs.timelock.type === UTXO.LockType.ABSOLUTE) {
    timelockValue = script.number.encode(
      bip65.encode({ blocks: scriptArgs.timelock.blockHeight }),
    );
    timelockMethod = opcodes.OP_CHECKLOCKTIMEVERIFY;
  } else {
    throw new Error(SwapError.INVALID_TIMELOCK_METHOD);
  }

  let swapScript: (number | Buffer)[];
  if (refundHashRipemd160Buffer) {
    swapScript = [
      opcodes.OP_DUP,
      opcodes.OP_HASH160,
      paymentHashRipemd160Buffer,
      opcodes.OP_EQUAL,
      opcodes.OP_IF,
      opcodes.OP_DROP,
      claimerPublicKeyBuffer,
      opcodes.OP_ELSE,
      opcodes.OP_DUP,
      opcodes.OP_HASH160,
      refundHashRipemd160Buffer,
      opcodes.OP_EQUAL,
      opcodes.OP_NOTIF,
      timelockValue,
      timelockMethod,
      opcodes.OP_ENDIF,
      opcodes.OP_DROP,
      opcodes.OP_DUP,
      opcodes.OP_HASH160,
      refundPublicKeyHashBuffer,
      opcodes.OP_EQUALVERIFY,
      opcodes.OP_ENDIF,
      opcodes.OP_CHECKSIG,
    ];
  } else {
    swapScript = [
      opcodes.OP_DUP,
      opcodes.OP_HASH160,
      paymentHashRipemd160Buffer,
      opcodes.OP_EQUAL,
      opcodes.OP_IF,
      opcodes.OP_DROP,
      claimerPublicKeyBuffer,
      opcodes.OP_ELSE,
      timelockValue,
      timelockMethod,
      opcodes.OP_DROP,
      opcodes.OP_DUP,
      opcodes.OP_HASH160,
      refundPublicKeyHashBuffer,
      opcodes.OP_EQUALVERIFY,
      opcodes.OP_ENDIF,
      opcodes.OP_CHECKSIG,
    ];
  }

  // We convert to hex, make a buffer, decompile, then convert to hex in case nSequence < 17. Decompile will append OP_ to those cases.
  // https://github.com/bitcoinjs/bitcoinjs-lib/issues/1485
  return convertScriptElementsToHex(
    script.decompile(
      Buffer.from(convertScriptElementsToHex(swapScript), 'hex'),
    ),
  );
}
