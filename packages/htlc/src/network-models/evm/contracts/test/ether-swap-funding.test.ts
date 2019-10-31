import { EtherSwapInstance } from '../types/truffle-contracts';
import { config, etherToWei } from './lib';
import { expect } from './lib/chai';

// tslint:disable:variable-name
const Swap = artifacts.require('EtherSwap');
Swap.numberFormat = 'String';

contract('EtherSwap - Funding', accounts => {
  const [{ orderUUID, hash, refundDelay }] = config.valid;
  let swapInstance: EtherSwapInstance;
  before(async () => {
    swapInstance = await Swap.deployed();
  });

  it('should change the order state when a valid funding payment is received', async () => {
    const res = await swapInstance.fund(orderUUID, hash, {
      from: accounts[1],
      value: etherToWei(0.01),
    });
    expect(res.logs).to.shallowDeepEqual([
      {
        event: 'OrderFundingReceived',
        args: {
          orderUUID,
          onchainAmount: etherToWei(0.01),
          paymentHash: hash,
          refundBlockHeight: String(res.receipt.blockNumber + refundDelay),
        },
      },
    ]);
  });

  it('should increment the on chain amount when a second valid funding payment is received', async () => {
    const res = await swapInstance.fund(orderUUID, hash, {
      from: accounts[1],
      value: etherToWei(0.01),
    });
    expect(res.logs).to.shallowDeepEqual([
      {
        event: 'OrderFundingReceived',
        args: {
          orderUUID,
          onchainAmount: etherToWei(0.01 * 2),
          paymentHash: hash,
          refundBlockHeight: String(res.receipt.blockNumber + refundDelay - 1), // because 1 function call: fund
        },
      },
    ]);
  });
});
