## ERC721DID Contracts

Solidity contracts that powers ERC721DID.

### How to Deploy

0. create dotenv file
1. (optional) deploy token
2. deploy parent contract
3. deploy factory contract

### FAQ

- How to Deploy? https://github.com/wighawag/hardhat-deploy

### Getting Started

如果是本地开发环境，需要复制 .env_example 新建 .env.local，提供里面的环境变量。

#### Install

```bash
pnpm i
```

#### Cleanup

> Only required if you want a clean setup

```bash
rm -rf deployments
```

#### Deploy ERC721DID Parent Contract + ERC721DID Factory Contract

> Will update .env
> If you want to re-deploy, please delete the ERC721DID_XXX_XXX in .env folder

```bash
# deploy goerli
npm run deploy -- --network goerli --tags deploy

# deploy base-mainnet
npm run deploy -- --network base-mainnet --tags deploy

# deploy base-goerli
npm run deploy -- --network base-goerli --tags deploy

# deploy bsc-test
npm run deploy -- --network bsc-test --tags deploy

# deploy sepolia
npm run deploy -- --network sepolia --tags deploy

# deploy optimism-goerli
npm run deploy -- --network optimism-goerli --tags deploy

# generate lib
npm run copy-to-lib

# batch verify contract
# If the chain is custom, should add info in hardhat.config.js - etherscan - customChains and apiKey
npm run batch-verify-contract
```

#### Dev ERC721DID Parent Contract + ERC721DID Factory Contract

> Will update .env.local

```bash
# bash 1
npm run node

# bash 2
npm run dev

# bash 3 if you want to deploy or test
npm run deploy:local
npm run test:local
```
