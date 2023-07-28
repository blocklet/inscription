const pick = require('lodash/pick');

const getContractMessageByReceipt = ({ receipt, ...rest }) => {
  return {
    ...pick(receipt, ['blockHash', 'transactionHash', 'blockNumber']),
    ...rest,
    effectiveGasPrice: receipt?.effectiveGasPrice?.toString(),
    createdAt: new Date().toISOString(),
  };
};

const getAuthPrincipal = async ({ extraParams }) => {
  const { chainId } = extraParams;

  if (chainId) {
    return {
      chainInfo: {
        type: 'ethereum',
        id: chainId, // string
        host: 'none', // must
      },
    };
  }

  return {
    chainInfo: {
      type: 'ethereum',
      id: '1', // string
      host: 'none', // must
    },
  };
};

module.exports = {
  getAuthPrincipal,
  getContractMessageByReceipt,
};
