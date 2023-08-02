const pick = require('lodash/pick');
const { verifyContract } = require('@arcblock/inscription-contract/contract');
const Contract = require('../db/contract');
const logger = require('./logger');

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

const verifyContractAndRecordDB = async ({
  chainId,
  apiKey,
  contractAddress,
  constructorArguements,
  updateDB = true,
}) => {
  const data = await verifyContract({
    chainId,
    apiKey,
    contractAddress,
    constructorArguements,
  });

  if (updateDB && data.verified) {
    await Contract.update(
      {
        _id: chainId,
      },
      {
        $set: {
          verified: true,
        },
      }
    );
  }

  logger.info('verify contract and record db: ', data);

  return data;
};

module.exports = {
  getAuthPrincipal,
  getContractMessageByReceipt,
  verifyContractAndRecordDB,
};
