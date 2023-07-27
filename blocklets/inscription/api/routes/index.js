const middleware = require('@blocklet/sdk/lib/middlewares');
const router = require('express').Router();
const reverse = require('lodash/reverse');
const keyBy = require('lodash/keyBy');
const { getEvmChainList, getProvider, ethers } = require('@arcblock/inscription-contract/contract');
const Inscription = require('@arcblock/inscription-contract/lib/Inscription.json');
const env = require('../libs/env');

const Contract = require('../db/contract');

router.get('/message/:chainId', middleware.user(), async (req, res) => {
  const { chainId } = req.params;
  if (!chainId) {
    throw new Error('chainId is required');
  }

  // await Contract.remove({
  //   _id: chainId,
  // });

  const { contractAddress } =
    (await Contract.findOne({
      _id: req.params.chainId,
    })) || {};

  if (!contractAddress) {
    res.json([]);
    return;
  }

  const provider = await getProvider(chainId);

  const contract = new ethers.Contract(contractAddress, Inscription.abi, provider);

  const allMessage = await contract.getAllMessage();

  const result = reverse(
    allMessage.map((item, index) => {
      return {
        message: item,
        index,
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
