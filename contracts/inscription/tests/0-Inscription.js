/* eslint-disable no-unused-vars */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const ethers = require('ethers');

const { getSigners } = require('../tools/helper');

const { setupContractEnv, createContractFactory, getProvider } = require('../tools/contract');

const Inscription = require('../tools/Inscription.json');

const initText = 'ABC';

// record deploy somethings
let deployHash1 = '';
let deployAddress1 = '';
let contract1 = null;

let deployHash2 = '';
let deployAddress2 = '';
let contract2 = null;

describe('Test Inscription Contract', () => {
  let signers;
  let deployer;
  let other;
  let provider;
  const localDIDWalletAddress = '0xc945F062d9B2e10637069733be4Dfbf0E3C9A3DC';

  before(async () => {
    setupContractEnv({
      customEvmChainList: [],
      isLocal: true,
    });

    ({ signers } = await getSigners());
    [deployer, other] = signers;

    provider = getProvider('31337');
    // send some token to localDIDWalletAddress
    await provider.getBalance(localDIDWalletAddress).then(async (balance) => {
      if (balance.toString() === '0') {
        // send token to localDIDWalletAddress
        await deployer.sendTransaction({
          to: localDIDWalletAddress,
          value: ethers.utils.parseEther('1000'),
        });
      }
    });
  });

  it('Contract1 deploy by private key', async () => {
    const contractFactory = await createContractFactory({
      abi: Inscription.abi,
      bytecode: Inscription.bytecode,
      signer: deployer,
    });

    let error = '';
    // deploy empty text
    try {
      const deployTx = await contractFactory.deploy('');
      await deployTx.deployed();
    } catch (_error) {
      error = _error.message;
    } finally {
      // can not deploy empty text
      await expect(error.indexOf('Message cannot be empty.')).to.be.gt(-1);
    }

    const deployTx = await contractFactory.deploy(initText);
    await deployTx.deployed();
    await expect(deployTx.deployTransaction.hash).to.be.a('string');
    deployHash1 = deployTx.deployTransaction.hash;
    deployAddress1 = deployTx.address;
    contract1 = new ethers.Contract(deployAddress1, Inscription.abi, deployer);
  });

  it('Contract2 deploy by Wallet sendTransaction', async () => {
    const contractFactory = await createContractFactory({
      abi: Inscription.abi,
      bytecode: Inscription.bytecode,
    });
    const deployTransaction = contractFactory.getDeployTransaction(initText);
    const encodeDeploy = deployTransaction.data;
    const deployTx = await deployer.sendTransaction({
      data: encodeDeploy,
      gasLimit: 3629054,
    });
    await deployTx.wait();
    await expect(deployTx.hash).to.be.a('string');
    deployHash2 = deployTx.hash;
    deployAddress2 = deployTx.creates;
    contract2 = new ethers.Contract(deployAddress2, Inscription.abi, deployer);
  });

  it('Inspection contracts should not be equal', async () => {
    await expect(deployHash1).to.not.equal(deployHash2);
    await expect(deployAddress1).to.not.equal(deployAddress2);
  });

  it('Deploy use Contract1 to record more messages', async () => {
    const newText = 'EFG';
    // record more
    const tx = await contract1.recordMessage(newText);
    await tx.wait();
    await expect(tx.hash).to.be.a('string');

    // check index 0
    const text0 = await contract1.getMessage(0);
    await expect(text0).to.be.equal(initText);

    // check index 1
    const text1 = await contract1.getMessage(1);
    await expect(text1).to.be.equal(newText);

    const allMessage = await contract1.getAllMessage();

    await expect(allMessage.length).to.be.equal(2);
    await expect(JSON.stringify(allMessage)).to.be.equal(JSON.stringify([initText, newText]));

    let error = '';
    // record more empty text
    try {
      const tx = await contract2.recordMessage('');
      await tx.wait();
    } catch (_error) {
      error = _error.message;
    } finally {
      // can not record empty text
      await expect(error.indexOf('Message cannot be empty.')).to.be.gt(-1);
    }
  });

  it('Other use Contract2 to record more messages', async () => {
    const newText = 'EFG';
    let error = '';
    // record by other
    try {
      const tx = await contract2.connect(other).recordMessage(newText);
      await tx.wait();
    } catch (_error) {
      error = _error.message;
    } finally {
      // can not record by other
      await expect(error.indexOf('Only the owner can call this function.')).to.be.gt(-1);
    }

    const allMessage = await contract2.getAllMessage();
    await expect(JSON.stringify(allMessage)).to.be.equal(JSON.stringify([initText]));
  });
});
