import {
  ERC20SwapInstance,
  ERC20TokenInstance,
} from '../types/truffle-contracts';
import { config } from './lib';
import { expect } from './lib/chai';

// tslint:disable:variable-name
const ERC20Token = artifacts.require('ERC20Token');
const ERC20Swap = artifacts.require('ERC20Swap');

contract('ERC20Swap - Claiming', accounts => {
  const [validArgs] = config.valid;
  const invalidArgs = config.invalid;

  let erc20TokenInstance: ERC20TokenInstance;
  let erc20SwapInstance: ERC20SwapInstance;
  before(async () => {
    // deploy test erc20 token
    erc20TokenInstance = await ERC20Token.deployed();
    // deploy erc20 swap contract
    erc20SwapInstance = await ERC20Swap.deployed();
    // approve token for transfer
    await erc20TokenInstance.approve(
      erc20SwapInstance.address,
      validArgs.tokenAmount,
    );
    // fund swap contract
    await erc20SwapInstance.fund(
      validArgs.orderUUID,
      validArgs.hash,
      erc20TokenInstance.address,
      validArgs.tokenAmount,
    );
  });

  it('should revert if the order does not exist', async () => {
    await expect(
      erc20SwapInstance.claim(
        invalidArgs.orderUUID,
        erc20TokenInstance.address,
        validArgs.preimage,
      ),
    ).to.be.rejectedWith(/VM Exception while processing transaction: revert/);
  });

  it('should revert if the preimage is incorrect', async () => {
    await expect(
      erc20SwapInstance.claim(
        validArgs.orderUUID,
        erc20TokenInstance.address,
        invalidArgs.preimage,
      ),
    ).to.be.rejectedWith(/VM Exception while processing transaction: revert/);
  });

  it('should succeed if the args are valid', async () => {
    const res = await erc20SwapInstance.claim(
      validArgs.orderUUID,
      erc20TokenInstance.address,
      validArgs.preimage,
    );
    expect(res.logs).to.shallowDeepEqual([
      {
        event: 'OrderErc20Claimed',
        args: {
          orderUUID: validArgs.orderUUID,
        },
      },
    ]);
  });
});
