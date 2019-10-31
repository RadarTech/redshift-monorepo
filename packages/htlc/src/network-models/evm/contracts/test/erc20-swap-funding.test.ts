import {
  ERC20SwapInstance,
  ERC20TokenInstance,
} from '../types/truffle-contracts';
import { config, expect } from './lib';

// tslint:disable:variable-name
const ERC20Token = artifacts.require('ERC20Token');
const ERC20Swap = artifacts.require('ERC20Swap');
ERC20Swap.numberFormat = 'String';

contract('ERC20Swap - Funding', accounts => {
  const [{ orderUUID, hash, tokenAmount, refundDelay }] = config.valid;
  let erc20TokenInstance: ERC20TokenInstance;
  let erc20SwapInstance: ERC20SwapInstance;

  before(async () => {
    // deploy test erc20 token
    erc20TokenInstance = await ERC20Token.deployed();
    // deploy erc20 swap contract
    erc20SwapInstance = await ERC20Swap.deployed();
  });

  it('should change the order state when a valid funding payment is received', async () => {
    // approve token for transfer
    await erc20TokenInstance.approve(erc20SwapInstance.address, tokenAmount);
    // fund swap contract
    const res = await erc20SwapInstance.fund(
      orderUUID,
      hash,
      erc20TokenInstance.address,
      tokenAmount,
    );
    expect(res.logs).to.shallowDeepEqual([
      {
        event: 'OrderErc20FundingReceived',
        args: {
          orderUUID,
          onchainAmount: tokenAmount.toString(),
          paymentHash: hash,
          refundBlockHeight: String(res.receipt.blockNumber + refundDelay),
          tokenContractAddress: erc20TokenInstance.address,
        },
      },
    ]);
  });

  it('should increment the on chain amount when a second valid funding payment is received', async () => {
    // approve token for transfer
    await erc20TokenInstance.approve(erc20SwapInstance.address, tokenAmount);
    // fund swap contract
    const res = await erc20SwapInstance.fund(
      orderUUID,
      hash,
      erc20TokenInstance.address,
      tokenAmount,
    );
    expect(res.logs).to.shallowDeepEqual([
      {
        event: 'OrderErc20FundingReceived',
        args: {
          orderUUID,
          onchainAmount: String(tokenAmount * 2),
          paymentHash: hash,
          refundBlockHeight: String(res.receipt.blockNumber + refundDelay - 2), // because 2 function calls: approve and fund
          tokenContractAddress: erc20TokenInstance.address,
        },
      },
    ]);
  });
});
