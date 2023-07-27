/* eslint-disable no-await-in-loop */
const fs = require('fs');
const assert = require('assert');
const path = require('path');
const pick = require('lodash/pick');
const Web3 = require('web3');
const crypto = require('crypto');
const isNil = require('lodash/isNil');
const random = require('lodash/random');
const chunk = require('lodash/chunk');
const bip39 = require('ethereum-cryptography/bip39');
const wallet = require('ethereumjs-wallet');
const MerkleTree = require('@ocap/merkle-tree');
const Mcrypto = require('@ocap/mcrypto');
const { hexToBytes } = require('web3-utils');
const { ethers } = require('hardhat');
const { parse, stringify } = require('envfile');

const BLACK_HOLE = '0x0000000000000000000000000000000000000000';

const keccak256 = Mcrypto.Hasher.Keccak.hash256;

const web3 = new Web3();

// prepare accounts
const HD_MNEMONIC = 'test test test test test test test test test test test junk';
const HD_DERIVE_PATH = "m/44'/60'/0'/0/";
const hdwallet = wallet.hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(HD_MNEMONIC));
const accounts = {};
const names = [
  'deployer',
  'seed1',
  'seed2',
  'validator1',
  'validator2',
  'user1',
  'user2',
  'user3',
  'user4',
  'vault',
  'vault2',
];
for (let i = 0; i < names.length; i++) {
  const { privateKey } = hdwallet.derivePath(HD_DERIVE_PATH + i).getWallet();
  const account = web3.eth.accounts.privateKeyToAccount(web3.utils.toHex(privateKey));
  account.index = i;
  account.name = names[i];
  accounts[names[i]] = account;
  accounts[account.address] = account;
}
const seedValidators = [accounts.seed1.address, accounts.seed2.address];
const seedSigners = [accounts.seed1, accounts.seed2];

// prepare singers
const getSigners = async () => {
  const signers = await ethers.getSigners();

  const getSigner = (name) => signers.find((x) => x.address === accounts[name].address) || signers[0];

  return { signers, getSigner };
};

// prepare contracts
const getContracts = async ({ deployArgsMap = {} } = {}) => {
  const InscriptionContract = await ethers.getContractFactory('Inscription');
  const Inscription = await InscriptionContract.deploy(...(deployArgsMap?.Inscription || []));

  return { Inscription };
};

const getSignatures = (message, signers = seedSigners, nonces = {}, forceInvalid = false) =>
  signers.map((x) => {
    const nonce = nonces[x.address] || 0;
    const encoded = MerkleTree.encodePacked({ type: 'uint256', value: nonce }, { type: 'bytes32', value: message });
    return {
      signer: x.address,
      signature: hexToBytes(
        web3.eth.accounts.sign(forceInvalid ? encoded : keccak256(encoded), x.privateKey).signature
      ),
      nonce,
    };
  });

const getTxHash = (size = 32) => `0x${crypto.randomBytes(size).toString('hex').toUpperCase()}`;

const getUser = () => {
  const users = ['user1', 'user2', 'user3', 'user4'];
  return accounts[users[random(0, users.length - 1)]];
};

const getTx = (account, type, amount) => ({
  type,
  hash: getTxHash(),
  to: account.address,
  amount: web3.utils.toWei(String(amount), 'ether'),
});

const getTxs = (count = 10) => {
  const txs = [];
  for (let i = 0; i < count; i++) {
    txs.push(getTx(getUser(), 'withdraw', random(100, 200)));
  }
  return txs;
};

const getBlocks = (count = 9, size = 4) => {
  const groups = chunk(getTxs(count * size), size);
  const blocks = [];
  groups.forEach((txs, index) => {
    const height = index + 1;

    let previousHash;
    if (height > 1) {
      previousHash = blocks[index - 1].blockHash;
    } else {
      previousHash = '';
    }

    const txsHash = MerkleTree.getListHash(txs.map((x) => x.hash));
    const merkleTree = MerkleTree.getBlockMerkleTree(txs);
    const merkleRoot = merkleTree.getHexRoot();
    const blockHash = MerkleTree.getBlockHash({ height, previousHash, merkleRoot, txsHash });

    blocks.push({ height, blockHash, merkleRoot, txsHash, txs });
  });

  return blocks;
};

const insertBlock = (blocks, txs, height) => {
  assert(height >= 1, 'height must be >= 1');
  const previousHash = height >= 2 ? blocks[height - 2].blockHash : '';
  const txsHash = MerkleTree.getListHash(txs.map((x) => x.hash));
  const merkleTree = MerkleTree.getBlockMerkleTree(txs);
  const merkleRoot = merkleTree.getHexRoot();
  const blockHash = MerkleTree.getBlockHash({ height, previousHash, merkleRoot, txsHash });
  const block = { height, blockHash, merkleRoot, txsHash, txs };

  blocks.splice(height - 1, 0, block);

  for (let i = height; i < blocks.length; i++) {
    const previous = blocks[i - 1];
    const current = blocks[i];
    current.height = i + 1;
    current.previousHash = previous.blockHash;
    current.blockHash = MerkleTree.getBlockHash(pick(current, ['height', 'previousHash', 'merkleRoot', 'txsHash']));
    blocks[i] = current;
  }
};

const getProofs = (tx, height, blocks) => {
  const { txs } = blocks[height - 1];
  const tree = MerkleTree.getBlockMerkleTree(txs);

  const element = MerkleTree.encodePacked(
    { type: 'bytes32', value: tx.hash },
    { type: 'address', value: tx.to },
    { type: 'uint256', value: tx.amount }
  );

  return tree.getHexProof(element);
};

const updateEnvFile = (updates, _nodeEnv) => {
  let nodeEnv = _nodeEnv || process.env.NODE_ENV;
  const isHardhatNode = process.env.npm_lifecycle_script.indexOf('hardhat node') !== -1;
  if (isHardhatNode) {
    nodeEnv = 'local';
  }
  const filePath = path.join(__dirname, '../', nodeEnv ? `.env.${nodeEnv}` : '.env');
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '');
  }
  const env = Object.assign(parse(fs.readFileSync(filePath, 'utf8')), updates);
  fs.writeFileSync(filePath, stringify(env));
};

const getEnvFile = (_nodeEnv) => {
  let nodeEnv = !isNil(_nodeEnv) ? _nodeEnv : process.env.NODE_ENV;
  const isHardhatNode = process.env.npm_lifecycle_script.indexOf('hardhat node') !== -1;
  if (isHardhatNode) {
    nodeEnv = 'local';
  }
  const filePath = path.join(__dirname, '../', nodeEnv ? `.env.${nodeEnv}` : '.env');
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const env = parse(fs.readFileSync(filePath, 'utf8'));
  return env;
};

const getNonces = async (contract, force = 0) => {
  const nonces = {};
  const validators = await contract.getValidators();
  for (const validator of validators) {
    const nonce = await contract.getNonce(validator);
    nonces[validator] = force || nonce.toNumber();
  }

  return nonces;
};

module.exports = {
  BLACK_HOLE,
  web3,
  accounts,
  insertBlock,
  seedValidators,
  seedSigners,
  getSigners,
  getContracts,
  getSignatures,
  getUser,
  getTxHash,
  getTx,
  getTxs,
  getBlocks,
  getProofs,
  getNonces,
  updateEnvFile,
  getEnvFile,
};
