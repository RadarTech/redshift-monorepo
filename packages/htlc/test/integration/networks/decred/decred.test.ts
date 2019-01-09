import explorers from 'bitcore-explorers';
import bitcore from 'bitcore-lib';
import { DecredHtlc, HTLC } from '../../../../src';
import { DecredSubnet, Network } from '../../../../src/types';
import { expect } from '../../../lib/helpers';

const network = bitcore.Networks.dcrdtestnet;
const insight = new explorers.Insight('https://testnet.decred.org', network);

describe('Decred HTLC - Decred Network', () => {
  // parsed from ln invoice
  const preimage =
    'c104ac676ab0b9005222043de34195f6666d92382e1e161eac7c9358f6eddeb0';
  // sha256(preimage) === hash
  const hash =
    '685db6a78d5af37aae9cb7531ffc034444a562c774e54a73201cc17d7388fcbd';
  // client private key
  const clientPrivateKey = new bitcore.PrivateKey(
    'f91b705c29978d7f5472201129f3edac61da67e4e2ec9dde1f6b989582321dbf',
    network,
  );
  const clientPublicKey = new bitcore.PublicKey(clientPrivateKey);
  const clientAddress = clientPublicKey.toAddress(network).toString();

  it('should fund htlc address and timelock', async () => {
    const htlc: DecredHtlc<Network.DECRED> = HTLC.construct(
      Network.DECRED,
      DecredSubnet.DCRTESTNET,
      {
        secret:
          '9cf492dcd4a1724470181fcfeff833710eec58fd6a4e926a8b760266dfde9659',
      },
    );
    // use a hard coded timelock to get expected fundAddress
    htlc.timelock = 1545950303;
    const fundAddress = htlc.fund(hash, clientAddress);
    expect(bitcore.Address.isValid(htlc.serverAddress)).to.equal(true);
    expect(fundAddress.toString()).to.equal(
      'TcsX4QyWV9GsWSHAWkJSJ6aUm1BxBB2tHxg',
    );
    expect(bitcore.Address.isValid(fundAddress)).to.equal(true);
  });

  it('should should create fund address then client funds', async () => {
    const htlc: DecredHtlc<Network.DECRED> = HTLC.construct(
      Network.DECRED,
      DecredSubnet.DCRTESTNET,
      {
        secret:
          '9cf492dcd4a1724470181fcfeff833710eec58fd6a4e926a8b760266dfde9659',
      },
    );

    // create fundAddress for client
    const fundAddress = htlc.fund(hash, clientAddress);

    // client creates transaction
    const spendTx = new bitcore.Transaction(network)
      .from(await getUnspentUtxos(clientAddress))
      .to(fundAddress, 1 * 100000000) // 100000000 atoms == 1 DCR
      .change(clientAddress)
      .sign(clientPrivateKey);

    // client broadcasts transaction
    await broadcastTransaction(spendTx.toString());

    await delay(1000);

    // check balance of fundAddress
    const fundAddressUtxos = await getUnspentUtxos(fundAddress.toString());
    const fundAddressBalance = fundAddressUtxos.reduce((prev, curr) => {
      return curr.atoms + prev;
    }, 0);
    expect(fundAddressBalance).to.equal(1 * 100000000);
  });

  it('should claim', async () => {
    const htlc: DecredHtlc<Network.DECRED> = HTLC.construct(
      Network.DECRED,
      DecredSubnet.DCRTESTNET,
      {
        secret:
          '9cf492dcd4a1724470181fcfeff833710eec58fd6a4e926a8b760266dfde9659',
      },
    );

    // get balance before claim
    const preServerUtxos = await getUnspentUtxos(htlc.serverAddress.toString());
    const preClaimServerBalance = preServerUtxos.reduce((prev, curr) => {
      return curr.atoms + prev;
    }, 0);

    // create fundAddress for client
    const fundAddress = htlc.fund(hash, clientAddress);

    // client creates transaction
    const spendTx = new bitcore.Transaction(network)
      .from(await getUnspentUtxos(clientAddress))
      .to(fundAddress, 1 * 100000000) // 100000000 atoms == 1 DCR
      .change(clientAddress)
      .sign(clientPrivateKey);

    // client broadcasts transaction
    await broadcastTransaction(spendTx.toString());

    // wait for confirmation

    // server gets preimage from paying lnd invoice to create transaction
    const claimTransaction = await htlc.claim(preimage);

    // broadcast claim transaction
    await htlc.broadcast(claimTransaction.toString());

    // get server balance after claim
    const postServerUtxos = await getUnspentUtxos(
      htlc.serverAddress.toString(),
    );
    const postClaimServerBalance = postServerUtxos.reduce((prev, curr) => {
      return curr.atoms + prev;
    }, 0);

    expect(postClaimServerBalance).to.be.greaterThan(preClaimServerBalance);
  });

  it('should refund', async () => {
    const htlc: DecredHtlc<Network.DECRED> = HTLC.construct(
      Network.DECRED,
      DecredSubnet.DCRTESTNET,
      {
        secret:
          '9cf492dcd4a1724470181fcfeff833710eec58fd6a4e926a8b760266dfde9659',
      },
    );

    htlc.timelock = 1545950305;
    // create fundAddress for client
    const fundAddress = htlc.fund(hash, clientAddress);

    // client creates transaction
    const spendTx = new bitcore.Transaction(network)
      .from(await getUnspentUtxos(clientAddress))
      .to(fundAddress, 1 * 100000000) // 100000000 atoms == 1 DCR
      .change(clientAddress)
      .sign(clientPrivateKey);

    // client broadcasts transaction
    await broadcastTransaction(spendTx.toString());

    // get client balance before refund
    const preClientRefundUtxo = await getUnspentUtxos(clientAddress);
    const preClientRefundBalance = preClientRefundUtxo.reduce((prev, curr) => {
      return curr.atoms + prev;
    }, 0);

    // get info from fund address
    const fundUtxos = await getUnspentUtxos(fundAddress.toString());
    const fundBalance = fundUtxos.reduce((prev, curr) => {
      return curr.atoms + prev;
    }, 0);

    // client gets script to refund
    const script = htlc.script;

    // client builds refund transaction
    const transaction = new bitcore.Transaction(network)
      .from(await getUnspentUtxos(fundAddress.toString()))
      .to(clientAddress, fundBalance - 10000)
      .lockUntilDate(Math.floor(Date.now() / 1000)); // CLTV

    // client signs refund transaction
    const signature = bitcore.Transaction.Sighash.sign(
      transaction,
      clientPrivateKey,
      1,
      0,
      script,
    );

    // setup the scriptSig of the spending transaction to spend the p2sh-cltv-p2pkh
    transaction.inputs[0].setScript(
      bitcore.Script.empty()
        .add(signature.toTxFormat())
        .add(new Buffer(clientPublicKey.toString(), 'hex'))
        .add('OP_FALSE') // choose the time-delayed refund code path
        .add(script.toBuffer()),
    );

    // broadcast transaction
    await broadcastTransaction(transaction.toString());

    // client should be refunded
    const postClientRefundUtxo = await getUnspentUtxos(clientAddress);
    const postClientRefundBalance = postClientRefundUtxo.reduce(
      (prev, curr) => {
        return curr.atoms + prev;
      },
      0,
    );
    expect(postClientRefundBalance).to.be.greaterThan(preClientRefundBalance);
  });
});

function getUnspentUtxos(
  address: string,
): Promise<bitcore.Transaction.UnspentOutput[]> {
  return new Promise((res, rej) => {
    insight.getUnspentUtxos(
      address,
      (err: any, utxos: bitcore.Transaction.UnspentOutput[]) => {
        if (err) rej(err);
        res(utxos);
      },
    );
  });
}

function broadcastTransaction(transaction: string) {
  return new Promise((res, rej) => {
    insight.broadcast(transaction, (err: any, txId: string) => {
      if (err) rej(err);
      res(txId);
    });
  });
}

function delay(ms: number) {
  return new Promise(res => {
    setTimeout(() => {
      res(true);
    }, ms);
  });
}
