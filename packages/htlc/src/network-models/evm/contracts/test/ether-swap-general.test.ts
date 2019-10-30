import { expect } from 'chai';
import { EtherSwapInstance } from '../types/truffle-contracts';

// tslint:disable:variable-name
const Swap = artifacts.require('EtherSwap');

contract('EtherSwap - General', accounts => {
  const deployer = accounts[0];
  let swapInstance: EtherSwapInstance;
  before(async () => {
    swapInstance = await Swap.deployed();
  });

  it('should return the contract owner', async () => {
    const owner = await swapInstance.owner();
    assert.equal(owner, deployer, 'Owner is deployer');
  });

  it('should return the default refund delay', async () => {
    const refundDelay = await swapInstance.refundDelay();
    assert.equal(refundDelay.toString(), '960');
  });

  it('should not allow a non-owner to set the refund delay', async () => {
    await expect(
      swapInstance.setRefundDelay(10 * 60 * 4, {
        from: accounts[2],
      }),
    ).to.be.rejectedWith(/VM Exception while processing transaction: revert/);
  });

  it('should not allow the owner to set the refund delay greater than the maximum', async () => {
    await expect(
      swapInstance.setRefundDelay(60 * 60 * 2 * 4 + 1),
    ).to.be.rejectedWith(/VM Exception while processing transaction: revert/);
  });

  it('should allow the owner to set the refund delay below the maximum', async () => {
    const defaultRefundDelay = await swapInstance.refundDelay();
    await swapInstance.setRefundDelay(10 * 60 * 4); // 10 hours
    const newRefundDelay = await swapInstance.refundDelay();

    assert.equal(defaultRefundDelay.toString(), '960'); // 4 hours
    assert.equal(newRefundDelay.toString(), '2400');
  });

  it('should allow transfer ownership', async () => {
    const newOwner = accounts[1];
    await swapInstance.transferOwnership(newOwner);
    const owner = await swapInstance.owner();
    assert.equal(owner, newOwner, 'New owner is deployer');
  });
});
