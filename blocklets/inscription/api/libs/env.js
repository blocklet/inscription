const env = require('@blocklet/sdk/lib/env');
const { setupContractEnv } = require('@arcblock/inscription-contract/contract');

const isLocal = ['true', true].includes(process.env.IS_LOCAL);

// setupContractEnv by blocklet pref
setupContractEnv({
  customEvmChainList: env?.preferences?.customEvmChainList || [],
});

module.exports = {
  ...env,
  chainHost: process.env.CHAIN_HOST || '',
  isLocal,
};
