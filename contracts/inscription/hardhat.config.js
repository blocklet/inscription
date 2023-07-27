/* eslint-disable no-console */
require('dotenv-flow').config();

require('hardhat-deploy');
require('hardhat-gas-reporter');
require('solidity-coverage');
require('@nomiclabs/hardhat-waffle');
require('hardhat-contract-sizer');
require('@nomiclabs/hardhat-etherscan');

const {
  INFURA_PROJECT_ID,
  DEPLOYER_PRIVATE_KEY,
  ETHERSCAN_API_KEY,
  OPTIMISTIC_API_KEY,
  BSCSCAN_API_KEY,
  BASESCAN_API_KEY,
  GETBLOCK_API_KEY,
} = process.env;

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
module.exports = {
  solidity: {
    compilers: [
      {
        version: '0.8.19',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
            details: {
              yul: true,
              yulDetails: {
                stackAllocation: true,
                optimizerSteps: 'dhfoDgvulfnTUtnIf',
              },
            },
          },
        },
      },
    ],
  },
  allowUnlimitedContractSize: true,
  // https://hardhat.org/hardhat-network/reference/#accounts
  accounts: {
    count: 20,
  },
  paths: {
    sources: 'src',
    tests: 'tests',
  },
  networks: {
    hardhat: {},
    goerli: {
      chainId: 5,
      url: `https://goerli.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: [DEPLOYER_PRIVATE_KEY],
    },
    'base-goerli': {
      chainId: 84531,
      url: 'https://goerli.base.org', // `https://base-goerli.infura.io/v3/${INFURA_PROJECT_ID}`, // 'https://goerli.base.org'
      accounts: [DEPLOYER_PRIVATE_KEY],
    },
    'base-mainnet': {
      chainId: 8453,
      url: 'https://developer-access-mainnet.base.org',
      accounts: [DEPLOYER_PRIVATE_KEY],
    },
    sepolia: {
      chainId: 11155111,
      url: `https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: [DEPLOYER_PRIVATE_KEY],
    },
    mainnet: {
      chainId: 1,
      url: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: [DEPLOYER_PRIVATE_KEY],
    },
    'bsc-main': {
      chainId: 56,
      url: 'https://bsc-dataseed1.binance.org',
      accounts: [DEPLOYER_PRIVATE_KEY],
    },
    'bsc-test': {
      chainId: 97,
      url: `https://bsc.getblock.io/${GETBLOCK_API_KEY}/testnet`,
      accounts: [DEPLOYER_PRIVATE_KEY],
    },
    'optimism-goerli': {
      chainId: 420,
      url: `https://optimism-goerli.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: [DEPLOYER_PRIVATE_KEY],
    },
  },

  // For plugins

  // for hardhat deploy
  namedAccounts: {
    deployer: 0,
    tokenOwner: 1,
  },

  // for gas-reporter
  gasReporter: {
    enabled: true,
    currency: 'ETH',
    gasPrice: 110,
    ethPrice: 1,
  },

  // for contract-sizer
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },

  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/ and https://bscscan.com/myapikey
    apiKey: {
      goerli: ETHERSCAN_API_KEY,
      sepolia: ETHERSCAN_API_KEY,
      bscTestnet: BSCSCAN_API_KEY,
      'base-goerli': BASESCAN_API_KEY,
      'base-mainnet': BASESCAN_API_KEY,
      optimisticGoerli: OPTIMISTIC_API_KEY,
    },
    customChains: [
      {
        network: 'base-goerli',
        chainId: 84531,
        urls: {
          apiURL: 'https://api-goerli.basescan.org/api',
          browserURL: 'https://goerli.basescan.org',
        },
      },
      {
        network: 'base-mainnet',
        chainId: 8453,
        urls: {
          apiURL: 'https://api.basescan.org/api',
          browserURL: 'https://basescan.org',
        },
      },
    ],
  },
};
