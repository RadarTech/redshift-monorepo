import {
  BitcoinSubnet,
  BlockResult,
  FundTxOutput,
  Network,
  RpcConnectionConfig,
  TxOutput,
} from '@radar/redshift-types';
import { UtxoRpcClient } from '@radar/redshift-utils';
import bip65 from 'bip65';
import { expect } from 'chai';
import { HTLC, UTXO, UtxoHtlc } from '../../../../src';
import { config, toSatoshi } from '../../../lib/helpers';
import { mineBlocks } from '../../../lib/helpers/btccli';
import { getRpcConnectionConfig } from '../../../lib/rpc-config';

const { funder, claimer, refunder } = config.bitcoin.integration;
const feeTokensPerVirtualByte = 1;
let htlc: UtxoHtlc<Network.BITCOIN>;
let rpcClient: UtxoRpcClient;
let coinbaseUtxos: FundTxOutput[];
let fundingUtxos: TxOutput[];
let htlcArgs: UTXO.RedeemScriptArgs;
let paymentSecret: string;

const ABSOLUTE_TIMELOCK: number = 5;
/**
 * Create an HTLC, fund it, and set the values necessary to take action on the swap.
 */
function setupTestSuite(
  refundAddress: string = refunder.p2pkhAddress,
  mineBlocksCount: number = 1,
) {
  before(async () => {
    await setCoinbaseUtxos();

    // Set the HTLC arguments being used
    const random = config.random.args(false);
    htlcArgs = {
      refundAddress,
      paymentHash: random.paymentHash,
      claimerPublicKey: claimer.publicKey,
      timelock: {
        type: UTXO.LockType.ABSOLUTE,
        blockHeight: (await rpcClient.getBlockCount()) + ABSOLUTE_TIMELOCK,
      },
    };
    paymentSecret = random.paymentSecret;

    // Create a new htlc
    htlc = HTLC.construct(Network.BITCOIN, BitcoinSubnet.SIMNET, htlcArgs);

    // Generate & broadcast the funding transaction
    const fundSatoshiAmount = toSatoshi(0.01);
    const fundTxHex = htlc.fund(
      coinbaseUtxos,
      fundSatoshiAmount,
      funder.privateKey,
      0,
    );
    const fundingTxId = await rpcClient.sendRawTransaction(fundTxHex);

    // Set claimable/refundable outputs
    const p2shOutput = (await rpcClient.getTransactionByHash(fundingTxId))
      .vout[0];
    fundingUtxos = [
      {
        txId: fundingTxId,
        index: 0,
        tokens: toSatoshi(p2shOutput.value),
      },
    ];

    // Mine the funding transaction
    await mineBlocks(mineBlocksCount);
  });
}

/**
 * Set the utxos that we will spend in the funding transaction
 */
async function setCoinbaseUtxos() {
  // Get spendable outputs for initial fund (generated coins can't be spent for 100 blocks)
  const coinbaseBlockNumber = (await rpcClient.getBlockCount()) - 100;
  const coinbaseBlockHash = await rpcClient.getBlockHash(coinbaseBlockNumber);
  const coinbaseBlock = (await rpcClient.getBlockByHash(
    coinbaseBlockHash,
  )) as BlockResult;
  const coinbaseTxId = coinbaseBlock.tx[0];
  const [coinbaseUtxo, coinbaseTx] = await Promise.all([
    rpcClient.getTxOutput(coinbaseTxId, 0),
    rpcClient.getTransactionByHash(coinbaseTxId),
  ]);

  coinbaseUtxos = [
    {
      txId: coinbaseTxId,
      index: 0,
      tokens: toSatoshi(coinbaseUtxo.value),
      txHex: coinbaseTx.hex,
    },
  ];
}

describe('UTXO BIP65 HTLC - Bitcoin Network', () => {
  before(async () => {
    // Mine 400 blocks ahead of the coinbase transaction. Segwit activates around 300.
    await mineBlocks(400);

    const connectionConfig: RpcConnectionConfig = getRpcConnectionConfig(
      Network.BITCOIN,
      BitcoinSubnet.SIMNET,
    );
    // Instantiate a new rpc client
    rpcClient = new UtxoRpcClient(connectionConfig);
  });

  describe('Fund', () => {
    setupTestSuite();

    it('should build a valid fund transaction and return a tx id when broadcast', async () => {
      expect(fundingUtxos[0].txId).to.be.a('string');
    });

    it('should have the correct funding values when mined', async () => {
      const bestBlockHash = await rpcClient.getBestBlockHash();
      const block = (await rpcClient.getBlockByHash(
        bestBlockHash,
      )) as BlockResult;
      const fundingTx = await rpcClient.getTransactionByHash(
        fundingUtxos[0].txId,
      );
      expect(block.tx.length).to.equal(2); // Coinbase & Funding Txs
      expect(fundingTx.vout[0].value).to.equal(0.01); // Funding Ouput
      expect(fundingTx.vout[1].value)
        .to.be.above(49.98)
        .and.below(50); // Change Output
    });
  });

  describe('Claim', async () => {
    setupTestSuite();

    let claimTxId: string;
    it('should build a valid claim transaction given valid parameters', async () => {
      const currentBlockHeight = await rpcClient.getBlockCount();
      const claimTxHex = htlc.claim(
        fundingUtxos,
        claimer.p2pkhAddress,
        currentBlockHeight,
        feeTokensPerVirtualByte,
        paymentSecret,
        claimer.privateKey,
      );
      claimTxId = await rpcClient.sendRawTransaction(claimTxHex);
      expect(claimTxId).to.be.a('string');
    });

    it('should have the correct claim values when mined', async () => {
      const bestBlockHash = await rpcClient.getBestBlockHash();
      const block = (await rpcClient.getBlockByHash(
        bestBlockHash,
      )) as BlockResult;
      const claimTx = await rpcClient.getTransactionByHash(claimTxId);
      expect(block.tx.length).to.equal(2); // Coinbase & Claim Txs
      expect(claimTx.vout[0].value)
        .to.be.above(0.009)
        .and.below(0.01); // Claim Output less tx fee
    });
  });

  describe('Refund', () => {
    describe('P2PKH Address Refund Fail Case', async () => {
      setupTestSuite();

      it('should not accept a refund if absolute timelock hasnt elapsed', async () => {
        const currentBlockHeight = await rpcClient.getBlockCount();
        const refundTxHex = htlc.refund(
          fundingUtxos,
          refunder.p2pkhAddress,
          currentBlockHeight,
          feeTokensPerVirtualByte,
          refunder.privateKey,
        );
        await expect(
          rpcClient.sendRawTransaction(refundTxHex),
        ).to.be.rejectedWith(/locktime requirement not satisfied/);
      });
    });

    describe('P2PKH Address Refund Success Case', async () => {
      setupTestSuite(undefined, ABSOLUTE_TIMELOCK);
      let refundTxId: string;

      it('should build a valid refund transaction given valid parameters', async () => {
        const currentBlockHeight = await rpcClient.getBlockCount();
        const refundTxHex = htlc.refund(
          fundingUtxos,
          refunder.p2pkhAddress,
          currentBlockHeight,
          feeTokensPerVirtualByte,
          refunder.privateKey,
        );
        refundTxId = await rpcClient.sendRawTransaction(refundTxHex);
        expect(refundTxId).to.be.a('string');
      });

      it('should have the correct refund values when mined', async () => {
        const refundTx = await rpcClient.getTransactionByHash(refundTxId);
        expect(refundTx.vout[0].value)
          .to.be.above(0.009)
          .and.below(0.01); // Refund Output less tx fee
      });
    });

    describe('P2WPKH Address Refund Fail Case', async () => {
      setupTestSuite(refunder.p2wpkhAddress);

      it('should not accept a refund if absolute timelock hasnt elapsed', async () => {
        const currentBlockHeight = await rpcClient.getBlockCount();
        const refundTxHex = htlc.refund(
          fundingUtxos,
          refunder.p2pkhAddress,
          currentBlockHeight,
          feeTokensPerVirtualByte,
          refunder.privateKey,
        );
        await expect(
          rpcClient.sendRawTransaction(refundTxHex),
        ).to.be.rejectedWith(/locktime requirement not satisfied/);
      });
    });

    describe('P2WPKH Address Refund Success Case', () => {
      setupTestSuite(refunder.p2wpkhAddress, ABSOLUTE_TIMELOCK);
      let refundTxId: string;
      it('should build a valid refund transaction given valid parameters', async () => {
        const currentBlockHeight = await rpcClient.getBlockCount();
        const refundTxHex = htlc.refund(
          fundingUtxos,
          refunder.p2pkhAddress,
          currentBlockHeight,
          feeTokensPerVirtualByte,
          refunder.privateKey,
        );
        refundTxId = await rpcClient.sendRawTransaction(refundTxHex);
        expect(refundTxId).to.be.a('string');
      });

      it('should have the correct refund values when mined', async () => {
        const refundTx = await rpcClient.getTransactionByHash(refundTxId);
        expect(refundTx.vout[0].value)
          .to.be.above(0.009)
          .and.below(0.01); // Refund Output less tx fee
      });
    });
  });
  describe('BIP65 Library', () => {
    it('should produce the correct output for seconds input', () => {
      const bip65Encoded = bip65.encode({ utc: 600000000 });
      expect(bip65Encoded).to.equal(600000000);
    });

    it('should produce the correct output for block input', () => {
      const bip65Encoded = bip65.encode({ blocks: 54 });
      expect(bip65Encoded).to.equal(0x00000036);
    });
  });
});
