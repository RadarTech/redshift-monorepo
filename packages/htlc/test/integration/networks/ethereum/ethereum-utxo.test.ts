import Web3 from 'web3';
import { EthereumHtlc, UtxoHtlc } from '../../../../src';
import { BitcoinSubnet, EthereumSubnet, Network } from '../../../../src/types';
import { config, expect, getRpcWebSocketUrl } from '../../../lib/helpers';
import { transactionResponseSchema } from '../../../lib/schemas';

describe('networks/ethereum/ethereum-htlc', () => {
  let web3: Web3;
  let htlc: EthereumHtlc<Network.ETHEREUM>;
  before(() => {
    web3 = new Web3(
      getRpcWebSocketUrl(Network.ETHEREUM, EthereumSubnet.GANACHE),
    );
    htlc = new EthereumHtlc(Network.ETHEREUM, EthereumSubnet.GANACHE, web3);
  });

  describe('Fund', () => {
    it('should build a fund transaction and return the unsigned transaction when the shouldSend flag is set to false', async () => {
      const { invoice, amount, paymentHash } = config.random.args();
      const unsignedFundingTx = await htlc.fund(
        amount,
        invoice,
        paymentHash,
        false,
      );
      const fundTxResult = await web3.eth.sendTransaction({
        ...unsignedFundingTx,
        from: config.ethereum.accounts[0],
        gas: 200000,
      });
      expect(fundTxResult).to.be.jsonSchema(transactionResponseSchema);
    });

    it('should build and send a fund transaction when the shouldSend flag is set to true', async () => {
      const { invoice, amount, paymentHash } = config.random.args();
      const fundTxResult = await htlc.fund(amount, invoice, paymentHash, true, {
        from: config.ethereum.accounts[0],
        gas: 200000,
      });
      expect(fundTxResult).to.be.jsonSchema(transactionResponseSchema);
    });
  });

  describe('Refund', () => {
    let args: {
      invoice: string;
      amount: string;
      paymentSecret: string;
      paymentHash: string;
    };

    before(async () => {
      // Set refund delay to something small
      await htlc.contract.methods.setRefundDelay(0).send({
        from: config.ethereum.accounts[0],
        gas: 150000,
      });
    });

    after(async () => {
      // Reset refund delay
      await htlc.contract.methods.setRefundDelay(4 * 60 * 4).send({
        from: config.ethereum.accounts[0],
        gas: 150000,
      });
    });

    beforeEach(async () => {
      args = config.random.args();

      // Fund the swap
      await htlc.fund(args.amount, args.invoice, args.paymentHash, true, {
        from: config.ethereum.accounts[0],
        gas: 200000,
      });
    });

    it('should build a refund transaction and return the unsigned transaction when the shouldSend flag is set to false', async () => {
      const unsignedRefundTx = await htlc.refund(args.invoice, false);
      const refundTxResult = await web3.eth.sendTransaction({
        ...unsignedRefundTx,
        from: config.ethereum.accounts[0],
        gas: 200000,
      });
      expect(refundTxResult).to.be.jsonSchema(transactionResponseSchema);
    });

    it('should build and send a refund transaction when the shouldSend flag is set to true', async () => {
      const refundTxResult = await htlc.refund(args.invoice, true, {
        from: config.ethereum.accounts[0],
        gas: 200000,
      });
      expect(refundTxResult).to.be.jsonSchema(transactionResponseSchema);
    });
  });
});