const middleware = require('@blocklet/sdk/lib/middlewares');
const router = require('express').Router();
const reverse = require('lodash/reverse');
const keyBy = require('lodash/keyBy');
const { getEvmChainList, getProvider, ethers } = require('@arcblock/inscription-contract/contract');
const Inscription = require('@arcblock/inscription-contract/lib/Inscription.json');
const env = require('../libs/env');
const { verifyContractAndRecordDB } = require('../libs');
const Contract = require('../db/contract');

router.post('/verify-contract', middleware.user(), async (req, res) => {
  const { chainId, apiKey } = req.body;
  if (!chainId) {
    throw new Error('chainId is required');
  }

  if (!apiKey) {
    throw new Error('apiKey is required');
  }

  const { contractAddress, messageList } =
    (await Contract.findOne({
      _id: chainId,
    })) || {};

  if (!contractAddress) {
    res.json(false);
    return;
  }

  const constructorTypes = ['string'];
  const constructorParams = [`${messageList[0].message || ''}`];

  // encode constructor arguements
  const constructorArguements = ethers.utils.defaultAbiCoder.encode(constructorTypes, constructorParams);

  const data = await verifyContractAndRecordDB({
    chainId,
    apiKey,
    contractAddress,
    constructorArguements: constructorArguements.replace('0x', ''), // must remove 0x
  });

  res.json(data);
});

router.get('/message/:chainId', middleware.user(), async (req, res) => {
  const { chainId } = req.params;
  if (!chainId) {
    throw new Error('chainId is required');
  }

  // await Contract.remove({
  //   _id: chainId,
  // });

  const { contractAddress, messageList } =
    (await Contract.findOne({
      _id: chainId,
    })) || {};

  if (!contractAddress) {
    res.json([]);
    return;
  }

  const provider = await getProvider(chainId);

  const contract = new ethers.Contract(contractAddress, Inscription.abi, provider);

  // from chain
  const allMessage = await contract.getAllMessage();

  const messageMap = keyBy(messageList, 'index');

  const result = reverse(
    allMessage.map((item, index) => {
      return {
        ...messageMap[index], // mixed db data from 0
        message: item,
        index: `#${index + 1}`, // ux show index from 1
      };
    })
  );
  res.json(result);
});

router.get('/env', middleware.user(), async (req, res) => {
  const contractList = await Contract.getAllData();
  const contractMap = keyBy(contractList, '_id');

  // const isOcapBeta = chainHost?.includes('beta');
  const evmChainList = getEvmChainList();
  const chainList = [
    ...evmChainList,
    // FIXME: support ocap chain
    // {
    //   chainId: 'default', // default to use ocap
    //   chainName: 'Ocap',
    //   isTest: isOcapBeta,
    //   icon: 'abt',
    //   enable: true,
    // },
  ]
    .filter((item) => {
      if (item && (env.isLocal || !item.local)) {
        return true;
      }
      return false;
    })
    .map((item) => {
      const { chainId } = item;
      return {
        ...item,
        // rewrite from db
        ...contractMap[chainId],
      };
    });

  // FIXME: base chain sort to first
  chainList.sort((a, b) => {
    // Base Mainnet
    if (a.chainName.includes('Base Mainnet') && !b.chainName.includes('Base Mainnet')) {
      return -1;
    }
    // Base other
    if (a.chainName.includes('Base') && !b.chainName.includes('Base')) {
      return -1;
    }
    return 1;
  });

  res.json({
    chainList,
  });
});

module.exports = router;
