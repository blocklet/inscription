// eslint-disable-next-line unicorn/filename-case
require('dotenv-flow').config();

const { getSigners } = require('../tools/helper');

module.exports = async function main(runtime) {
  const { deployments } = runtime;
  const { deploy } = deployments;

  const { getSigner } = await getSigners();

  const deployer = getSigner('deployer');

  const balance = await deployer.getBalance();

  console.warn('deployer balance:', balance.toString());

  const gasPrice = await deployer.provider.getGasPrice();

  console.warn('gasPrice:', gasPrice.toString());

  const contract = await deploy('Inscription', {
    gasPrice: gasPrice.toString(),
    from: deployer.address,
    args: ['First Message'],
    log: true,
  });
  // 拿到的合约地址 0x1560D685b671ED97595f39a88E978bf7D3793451
  // npx hardhat verify --network base-mainnet 0x1560D685b671ED97595f39a88E978bf7D3793451 "0x6D4733bBE176FAd22e9E8D069BA34781F792D9aF"
  console.warn('Inscription deployed at: ', contract.address);
};

module.exports.tags = ['test', 'erc721did-proxy', 'proxy'];
