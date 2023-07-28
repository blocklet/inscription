import require$$0 from 'dotenv-flow';
import * as ethers$1 from 'ethers';
import require$$2 from 'axios';
import require$$3 from 'qs';
import require$$4 from 'p-wait-for';
import * as util from '@ocap/util';
import require$$6 from 'lodash/upperFirst';
import require$$7 from 'lodash/keyBy';
import require$$8 from 'lodash/pick';

function getAugmentedNamespace(n) {
  if (n.__esModule) return n;
  var f = n.default;
	if (typeof f == "function") {
		var a = function a () {
			if (this instanceof a) {
        return Reflect.construct(f, arguments, this.constructor);
			}
			return f.apply(this, arguments);
		};
		a.prototype = f.prototype;
  } else a = {};
  Object.defineProperty(a, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

var contract$1 = {};

var require$$1 = /*@__PURE__*/getAugmentedNamespace(ethers$1);

var require$$5 = /*@__PURE__*/getAugmentedNamespace(util);

var require$$9 = [
	{
		networkName: "mainnet",
		chainName: "Ethereum Mainnet",
		chainId: "1",
		symbol: "ETH",
		defaultRPC: "https://mainnet.infura.io/v3/2ddf4a827a12475c8eb172b51d567584",
		explorer: "https://etherscan.io",
		verifyUrl: "https://api.etherscan.io/api",
		icon: "eth",
		enable: true,
		decimal: 18,
		isTest: false
	},
	{
		networkName: "goerli",
		chainName: "Goerli",
		chainId: "5",
		symbol: "ETH (Goerli)",
		defaultRPC: "https://goerli.infura.io/v3/2ddf4a827a12475c8eb172b51d567584",
		explorer: "https://goerli.etherscan.io",
		verifyUrl: "https://api-goerli.etherscan.io/api",
		icon: "eth",
		enable: true,
		decimal: 18,
		isTest: true
	},
	{
		networkName: "bsc-test",
		chainName: "Binance Smart Chain",
		chainId: "97",
		symbol: "tBNB",
		defaultRPC: "https://bsc.getblock.io/6e19d7c6-5532-4fd8-9e7b-12e9b194f909/testnet",
		explorer: "https://testnet.bscscan.com",
		verifyUrl: "https://api-testnet.bscscan.com/api",
		icon: "bnb",
		enable: true,
		decimal: 18,
		isTest: true
	},
	{
		networkName: "optimism-goerli",
		chainName: "Optimism Goerli",
		chainId: "420",
		symbol: "ETH (Optimism Goerli)",
		defaultRPC: "https://optimism-goerli.infura.io/v3/2ddf4a827a12475c8eb172b51d567584",
		explorer: "https://goerli-optimism.etherscan.io",
		verifyUrl: "https://api-goerli-optimism.etherscan.io/api",
		icon: "optimism",
		enable: false,
		decimal: 18,
		isTest: true
	},
	{
		networkName: "base-mainnet",
		chainName: "Base Mainnet",
		chainId: "8453",
		symbol: "ETH",
		defaultRPC: "https://developer-access-mainnet.base.org",
		explorer: "https://basescan.org",
		verifyUrl: "https://api.basescan.org/api",
		icon: "base",
		enable: true,
		decimal: 18,
		isTest: false
	},
	{
		networkName: "localhost",
		chainName: "Localhost",
		chainId: "31337",
		symbol: "ETH (Localhost)",
		defaultRPC: "http://localhost:8545",
		explorer: "http://localhost:8545",
		verifyUrl: "http://localhost:8545",
		icon: "eth",
		enable: true,
		decimal: 18,
		isTest: true,
		local: true
	},
	{
		networkName: "base-goerli",
		chainName: "Base Goerli",
		chainId: "84531",
		symbol: "ETH (Base Goerli)",
		defaultRPC: "https://goerli.base.org",
		explorer: "https://goerli.basescan.org",
		verifyUrl: "https://api-goerli.basescan.org/api",
		icon: "base",
		enable: true,
		decimal: 18,
		isTest: true
	},
	{
		networkName: "sepolia",
		chainName: "Sepolia",
		chainId: "11155111",
		symbol: "ETH (Sepolia)",
		defaultRPC: "https://sepolia.infura.io/v3/2ddf4a827a12475c8eb172b51d567584",
		explorer: "https://sepolia.etherscan.io",
		verifyUrl: "https://api-sepolia.etherscan.io/api",
		icon: "eth",
		enable: false,
		decimal: 18,
		isTest: true
	}
];

var module = "contract";
var action = "verifysourcecode";
var codeformat = "solidity-single-file";
var runs = 200;
var optimizationUsed = 1;
var sourceCode = "// SPDX-License-Identifier: Unlicense\npragma solidity ^0.8.19;\n\n// .___                           .__        __  .__\n// |   | ____   ______ ___________|__|______/  |_|__| ____   ____\n// |   |/    \\ /  ___// ___\\_  __ \\  \\____ \\   __\\  |/  _ \\ /    \\\n// |   |   |  \\\\___ \\\\  \\___|  | \\/  |  |_> >  | |  (  <_> )   |  \\\n// |___|___|  /____  >\\___  >__|  |__|   __/|__| |__|\\____/|___|  /\n//          \\/     \\/     \\/         |__|                       \\/\n//\n// Powered by ArcBlock (https://github.com/blocklet/inscription)\n\ncontract Inscription {\n  address public owner;\n  uint256 private messageCount = 0;\n  mapping(uint256 => string) private messages;\n  event RecordedMessage(uint256 indexed index, string message);\n\n  modifier onlyOwner() {\n    require(msg.sender == owner, 'Only the owner can call this function.');\n    _;\n  }\n\n  modifier messageNotEmpty(string memory message) {\n    require(bytes(message).length > 0, 'Message cannot be empty.');\n    _;\n  }\n\n  constructor(string memory firstMessage) {\n    owner = msg.sender;\n    recordMessage(firstMessage);\n  }\n\n  function recordMessage(string memory message) public onlyOwner messageNotEmpty(message) {\n    messages[messageCount] = message;\n    emit RecordedMessage(messageCount, message);\n    messageCount++;\n  }\n\n  function getMessage(uint256 index) public view returns (string memory) {\n    require(index >= 0 && index <= messageCount, 'Invalid message index.');\n    return messages[index];\n  }\n\n  function getAllMessage() public view returns (string[] memory) {\n    string[] memory allMessage = new string[](messageCount);\n    for (uint256 i = 0; i < messageCount; i++) {\n      allMessage[i] = messages[i];\n    }\n    return allMessage;\n  }\n}\n";
var contractname = "Inscription";
var compilerversion = "v0.8.19+commit.7dd6d404";
var require$$10 = {
	module: module,
	action: action,
	codeformat: codeformat,
	runs: runs,
	optimizationUsed: optimizationUsed,
	sourceCode: sourceCode,
	contractname: contractname,
	compilerversion: compilerversion
};

/* eslint-disable no-unused-vars */

/* eslint-disable no-undef */
require$$0.config();
const ethers = require$$1;
const axios = require$$2;
const qs = require$$3;
const waitFor = require$$4;
const { toBase58 } = require$$5;
const upperFirst = require$$6;
const keyBy = require$$7;
const pick = require$$8;
const defaultChainList = require$$9;
const defaultVerifyContract = require$$10;

const CUSTOM_CHAIN_MAP = {};
const CHAIN_MAP = {};

const api = axios.create({});

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
    verifyUrl: 'https://api.etherscan.io/api',
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
    verifyUrl: 'https://api-goerli.etherscan.io/api',
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
    verifyUrl: 'http://localhost:8545',
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
    verifyUrl: 'https://api.basescan.org/api',
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
    verifyUrl: 'https://api-goerli.basescan.org/api',
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
    verifyUrl: 'https://api-sepolia.etherscan.io/api',
    icon: 'eth',
    enable: false, // FIXME: not support by DID Wallet
    decimal: 18,
    isTest: true,
  },
  97: {
    networkName: 'bsc-test',
    chainName: 'Binance Smart Chain',
    chainId: '97',
    symbol: 'tBNB',
    defaultRPC: `https://bsc.getblock.io/${GETBLOCK_API_KEY}/testnet`,
    explorer: 'https://testnet.bscscan.com',
    verifyUrl: 'https://api-testnet.bscscan.com/api',
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
    verifyUrl: 'https://api-goerli-optimism.etherscan.io/api',
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
    const { data } = await api.get(`https://token-data.arcblock.io/api/gas-prices?chainId=${chainId}`);
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
async function verifyContract({ chainId, apiKey, contractAddress, ...restParams }) {
  const { verifyUrl } = getChainInfo(chainId);

  const allParams = {
    ...defaultVerifyContract,
    ...restParams,
    contractaddress: contractAddress,
    apikey: apiKey,
  };

  const result = await api.post(verifyUrl, qs.stringify(allParams), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return result;
}

var ethers_1 = contract$1.ethers = ethers;
var getTxData_1 = contract$1.getTxData = getTxData;
var getGasPrice_1 = contract$1.getGasPrice = getGasPrice;
var waitForTxReceipt_1 = contract$1.waitForTxReceipt = waitForTxReceipt;
var onContractFilter_1 = contract$1.onContractFilter = onContractFilter;
var getChainId_1 = contract$1.getChainId = getChainId;
var getChainInfo_1 = contract$1.getChainInfo = getChainInfo;
var getBlockExplorerUrl_1 = contract$1.getBlockExplorerUrl = getBlockExplorerUrl;
var getTxExplorerUrl_1 = contract$1.getTxExplorerUrl = getTxExplorerUrl;
var getAddressExplorerUrl_1 = contract$1.getAddressExplorerUrl = getAddressExplorerUrl;
var getEvmChainList_1 = contract$1.getEvmChainList = getEvmChainList;
var setupContractEnv_1 = contract$1.setupContractEnv = setupContractEnv;
var getChainIdByChainName_1 = contract$1.getChainIdByChainName = getChainIdByChainName;
var createContractFactory_1 = contract$1.createContractFactory = createContractFactory;
var getDynamicChainMap_1 = contract$1.getDynamicChainMap = getDynamicChainMap;
var getProvider_1 = contract$1.getProvider = getProvider;
var verifyContract_1 = contract$1.verifyContract = verifyContract;
var waitFor_1 = contract$1.waitFor = waitFor;

export { createContractFactory_1 as createContractFactory, contract$1 as default, ethers_1 as ethers, getAddressExplorerUrl_1 as getAddressExplorerUrl, getBlockExplorerUrl_1 as getBlockExplorerUrl, getChainId_1 as getChainId, getChainIdByChainName_1 as getChainIdByChainName, getChainInfo_1 as getChainInfo, getDynamicChainMap_1 as getDynamicChainMap, getEvmChainList_1 as getEvmChainList, getGasPrice_1 as getGasPrice, getProvider_1 as getProvider, getTxData_1 as getTxData, getTxExplorerUrl_1 as getTxExplorerUrl, onContractFilter_1 as onContractFilter, setupContractEnv_1 as setupContractEnv, verifyContract_1 as verifyContract, waitFor_1 as waitFor, waitForTxReceipt_1 as waitForTxReceipt };
