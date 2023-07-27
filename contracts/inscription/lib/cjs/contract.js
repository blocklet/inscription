/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
require('dotenv-flow').config();
const ethers = require('ethers');
const axios = require('axios');
const waitFor = require('p-wait-for');
const { toBase58 } = require('@ocap/util');
const upperFirst = require('lodash/upperFirst');
const keyBy = require('lodash/keyBy');
const pick = require('lodash/pick');
const defaultChainList = require('./EvmChainList.json');

const CUSTOM_CHAIN_MAP = {};
const CHAIN_MAP = {};

// setup by defaultChainList
defaultChainList.forEach((chain) => {
  const { chainId } = chain;
  CHAIN_MAP[chainId] = chain;
});

const getDynamicChainMap = ({ INFURA_PROJECT_ID, GETBLOCK_API_KEY }) => ({
  1: {
    networkName: 'mainnet',
    chainName: 'Ethereum Mainnet',
    chainId: '1',
    symbol: 'ETH',
    defaultRPC: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
    explorer: 'https://etherscan.io',
    icon: 'eth',
    enable: true,
    decimal: 18,
    isTest: false,
  },
  5: {
    networkName: 'goerli',
    chainName: 'Goerli',
    chainId: '5',
    symbol: 'ETH (Goerli)',
    defaultRPC: `https://goerli.infura.io/v3/${INFURA_PROJECT_ID}`,
    explorer: 'https://goerli.etherscan.io',
    icon: 'eth',
    enable: true,
    decimal: 18,
    isTest: true,
  },
  31337: {
    networkName: 'localhost',
    chainName: 'Localhost',
    chainId: '31337',
    symbol: 'ETH (Localhost)',
    defaultRPC: 'http://localhost:8545',
    explorer: 'http://localhost:8545',
    icon: 'eth',
    enable: true,
    decimal: 18,
    isTest: true,
    local: true,
  },
  8453: {
    networkName: 'base-mainnet',
    chainName: 'Base Mainnet',
    chainId: '8453',
    symbol: 'ETH',
    defaultRPC: 'https://developer-access-mainnet.base.org',
    explorer: 'https://basescan.org',
    icon: 'base',
    enable: true,
    decimal: 18,
    isTest: false,
  },
  84531: {
    networkName: 'base-goerli',
    chainName: 'Base Goerli',
    chainId: '84531',
    symbol: 'ETH (Base Goerli)',
    defaultRPC: 'https://goerli.base.org',
    explorer: 'https://goerli.basescan.org',
    icon: 'base',
    enable: true,
    decimal: 18,
    isTest: true,
  },
  11155111: {
    networkName: 'sepolia',
    chainName: 'Sepolia',
    chainId: '11155111',
    symbol: 'ETH (Sepolia)',
    defaultRPC: `https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`,
    explorer: 'https://sepolia.etherscan.io',
    icon: 'eth',
    enable: false, // FIXME: not support by DID Wallet
    decimal: 18,
    isTest: true,
  },
  97: {
    networkName: 'bsc-test',
    chainName: 'BNB (Binance Smart Chain)',
    chainId: '97',
    symbol: 'tBNB',
    defaultRPC: `https://bsc.getblock.io/${GETBLOCK_API_KEY}/testnet`,
    explorer: 'https://testnet.bscscan.com',
    icon: 'bnb',
    enable: true,
    decimal: 18,
    isTest: true,
  },
  420: {
    networkName: 'optimism-goerli',
    chainName: 'Optimism Goerli',
    chainId: '420',
    symbol: 'ETH (Optimism Goerli)',
    defaultRPC: `https://optimism-goerli.infura.io/v3/${INFURA_PROJECT_ID}`,
    explorer: 'https://goerli-optimism.etherscan.io',
    icon: 'optimism',
    enable: false, // FIXME: not support by DID Wallet
    decimal: 18,
    isTest: true,
  },
});

function getProvider(chainId) {
  const { defaultRPC } = getChainInfo(chainId);
  return new ethers.providers.JsonRpcProvider(defaultRPC);
}

async function getGasPrice({ provider }) {
  const gwei = 1000000000;

  const chainId = await getChainId({ contract });

  // ethereum
  if ([1, '1', 'mainnet', 'eth-main'].includes(chainId)) {
    const { data } = await axios.get(`https://token-data.arcblock.io/api/gas-prices?chainId=${chainId}`);
    return (data.fast / 10) * gwei;
  }

  if ([5, '5', 'goerli', 'eth-goerli'].includes(chainId)) {
    const { gasPrice } = await provider.getFeeData();
    return gasPrice.toString();
  }

  // hardhat
  if ([31337, '31337', 'hardhat'].includes(chainId)) {
    return 1 * gwei;
  }

  // TODO: bsc
  // TODO: matic
  // TODO: fantom

  return 1 * gwei;
}

async function getTxData(params = {}, type = 'arcblock') {
  const { contract, fn, args, value, txData: _txData, chainId: _chainId, gasLimit: _gasLimit, to: _to } = params;

  // if txData is set, ignore fn and args
  const txData = _txData || contract.interface.encodeFunctionData(fn, args);

  // if txData is set, ignore contract
  const chainId = _chainId || (await getChainId({ contract }));

  // const gasPrice = await getGasPrice({ provider: contract.provider });
  // const gasPriceAsGwei = Math.ceil(ethers.utils.formatUnits(gasPrice, 'gwei').toString());

  const extraEtherValueMap = value
    ? {
        value,
      }
    : {};

  const to = _to || contract?.address || null;

  const gasLimit =
    _gasLimit ||
    (await contract.provider
      .estimateGas({
        to,
        data: txData,
        ...extraEtherValueMap,
      })
      .then((res) => res.toString()));

  if (type === 'arcblock') {
    return toBase58(
      Buffer.from(
        JSON.stringify({
          network: chainId,
          tx: {
            to,
            value: '0',
            gasLimit,
            ...extraEtherValueMap,
            data: txData,
          },
        }),
        'utf-8'
      )
    );
  }

  return {
    txData,
    gasLimit,
  };
}

const waitForTxReceipt = async ({ contract, provider, txHash }) => {
  let tx = {};
  let receipt = {};
  const txHashTemp = txHash;

  await waitFor(
    async () => {
      // ethers getTransaction
      tx = await provider.getTransaction(txHashTemp);
      return !!tx?.blockNumber;
    },
    { interval: 3000, timeout: 30 * 60 * 1000 }
  );

  await waitFor(
    async () => {
      // ethers getTransactionReceipt
      const originReceipt = await provider.getTransactionReceipt(txHashTemp);
      receipt = {
        ...originReceipt,
        parseLog:
          contract &&
          originReceipt?.logs?.map((log) => {
            try {
              return contract.interface.parseLog(log);
            } catch (_error) {
              return log;
            }
          }),
      };
      return !!receipt?.blockNumber;
    },
    { interval: 3000, timeout: 30 * 60 * 1000 }
  );

  return receipt;
};

const onContractFilter = async ({ contract, fn, onSuccess }) => {
  contract.provider.on(
    {
      address: contract.address,
      topics: [contract.interface.getEventTopic(upperFirst(fn))],
    },
    async (res) => {
      await onSuccess(res);
    }
  );
};

// @private
const getChainIdByChainName = (chainName) => {
  return keyBy(
    {
      ...CHAIN_MAP,
      ...CUSTOM_CHAIN_MAP,
    },
    'networkName'
  )[chainName].chainId;
};

const getChainId = async ({ contract }) => {
  const chainId = await contract.provider.getNetwork().then((res) => res.chainId);
  return `${chainId}`;
};

const setupContractEnv = ({
  customEvmChainList = [],
  INFURA_PROJECT_ID: _INFURA_PROJECT_ID,
  GETBLOCK_API_KEY: _GETBLOCK_API_KEY,
}) => {
  customEvmChainList?.forEach((chain) => {
    const { chainId } = chain;
    CUSTOM_CHAIN_MAP[chainId] = chain;
  });
  INFURA_PROJECT_ID = _INFURA_PROJECT_ID;
  GETBLOCK_API_KEY = _GETBLOCK_API_KEY;
};

const getChainInfo = (chainId) => {
  return {
    ...CHAIN_MAP[chainId],
    ...CUSTOM_CHAIN_MAP[chainId],
  };
};

const getExplorerUrl = (chainId) => {
  const { explorer } = getChainInfo(chainId);

  return `${explorer}`;
};

const getAddressExplorerUrl = ({ chainId, hash }) => {
  return `${getExplorerUrl(chainId)}/address/${hash}`;
};

const getBlockExplorerUrl = ({ chainId, blockletNumber }) => {
  return `${getExplorerUrl(chainId)}/block/${blockletNumber}`;
};

const getTxExplorerUrl = ({ chainId, hash }) => {
  return `${getExplorerUrl(chainId)}/tx/${hash}`;
};

const getCloneContractArgs = ({
  ownerAddress,
  baseImageURI,
  contractName,
  contractSymbol = '',
  contractDescription,
  totalLimit = 0,
  price = '0',
  transferTokenAddress,
} = {}) => {
  const params = [
    ownerAddress,
    baseImageURI,
    contractName,
    contractSymbol,
    contractDescription,
    totalLimit,
    price,
    transferTokenAddress || ownerAddress,
  ];
  return params;
};

const getEvmChainList = () => {
  // eslint-disable-next-line global-require
  let currentChainList = defaultChainList;
  // CUSTOM_CHAIN_MAP is setup by setupContractEnv
  if (Object.keys(CUSTOM_CHAIN_MAP).length > 0) {
    currentChainList = currentChainList.map((item) => {
      const { chainId } = item;
      if (CUSTOM_CHAIN_MAP[chainId]) {
        // override
        return {
          ...item,
          ...pick(CUSTOM_CHAIN_MAP[chainId], ['enable', 'defaultRPC', 'explorer']),
        };
      }
      return item;
    });
  }
  return currentChainList;
};

async function createContractFactory({ abi, bytecode, signer } = {}) {
  const factory = new ethers.ContractFactory(abi, bytecode, signer);
  return factory;
}

// batch verify parent contract
async function verifyContract(network, defaultValue) {
  const command = `npx hardhat verify --network ${network} ${defaultValue}`;
}

module.exports.ethers = ethers;
module.exports.getTxData = getTxData;
module.exports.getGasPrice = getGasPrice;
module.exports.waitForTxReceipt = waitForTxReceipt;
module.exports.onContractFilter = onContractFilter;
module.exports.getChainId = getChainId;
module.exports.getChainInfo = getChainInfo;
module.exports.getBlockExplorerUrl = getBlockExplorerUrl;
module.exports.getTxExplorerUrl = getTxExplorerUrl;
module.exports.getAddressExplorerUrl = getAddressExplorerUrl;
module.exports.getCloneContractArgs = getCloneContractArgs;
module.exports.getEvmChainList = getEvmChainList;
module.exports.setupContractEnv = setupContractEnv;
module.exports.getChainIdByChainName = getChainIdByChainName;
module.exports.createContractFactory = createContractFactory;
module.exports.getDynamicChainMap = getDynamicChainMap;
module.exports.getProvider = getProvider;
module.exports.verifyContract = verifyContract;
module.exports.waitFor = waitFor;
