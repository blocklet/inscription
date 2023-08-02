const { fromPublicKey } = require('@ocap/wallet');
const { toTypeInfo, isEthereumDid } = require('@arcblock/did');
const {
  getTxData,
  waitForTxReceipt,
  ethers,
  createContractFactory,
  getProvider,
} = require('@arcblock/inscription-contract/contract');
const Inscription = require('@arcblock/inscription-contract/lib/Inscription.json');
const Contract = require('../../db/contract');
const logger = require('../../libs/logger');
const { getAuthPrincipal, getContractMessageByReceipt, verifyContractAndRecordDB } = require('../../libs');

module.exports = {
  action: 'deploy-contract',
  claims: [
    {
      authPrincipal: getAuthPrincipal,
    },
    {
      signature: async ({ userDid, extraParams }) => {
        const { chainId, message } = extraParams;

        const isETHWalletType = isEthereumDid(userDid);

        logger.info({ isETHWalletType, chainId, message });

        if (isETHWalletType) {
          const provider = await getProvider(chainId);
          const contractFactory = await createContractFactory({
            abi: Inscription.abi,
            bytecode: Inscription.bytecode,
          });

          const bytecode = contractFactory.getDeployTransaction(message).data;

          const estimatedGas = await provider.estimateGas({
            data: bytecode,
          });

          const txData = await getTxData({
            gasLimit: Math.ceil(estimatedGas * 1.5).toString(), // add 50% gasLimit
            to: null,
            txData: bytecode,
            chainId,
            value: '0', // is free
          });

          return {
            description: 'Please sign the transaction to deploy contract',
            type: 'eth:transaction',
            data: txData,
          };
        }

        throw new Error('Unsupported wallet type');
      },
    },
  ],

  onAuth: async ({ userDid, userPk, claims, updateSession, extraParams }) => {
    const { chainId } = extraParams;
    const type = toTypeInfo(userDid);
    const wallet = fromPublicKey(userPk, type);
    const claim = claims.find((x) => x.type === 'signature');

    const isETHWalletType = isEthereumDid(wallet.address);

    if (isETHWalletType) {
      const { hash } = claim;
      logger.info('deploy contract tx hash:', { hash });
      if (hash) {
        const provider = await getProvider(chainId);

        await updateSession({
          txHash: hash,
        });

        // FIXME: txHash may be speeding up by DID Wallet, so we need to wait for the real tx
        waitForTxReceipt({ txHash: hash, provider })
          .then(async (receipt) => {
            const { logs, contractAddress } = receipt;
            const contract = new ethers.Contract(contractAddress, Inscription.abi, provider);
            const parseLog = logs.map((log) => contract.interface.parseLog(log));
            const { args = [] } = parseLog?.find((item) => item.name === 'RecordedMessage') || {};
            const index = args[0]?.toString();
            const message = args[1]?.toString();

            receipt.parseLog = parseLog;

            logger.info('deploy contract tx receipt:', {
              receipt,
              contractAddress,
            });

            let verified = false;

            try {
              const constructorTypes = ['string'];
              const constructorParams = [`${message || ''}`];

              // encode constructor arguements
              const constructorArguements = ethers.utils.defaultAbiCoder.encode(constructorTypes, constructorParams);
              const verifyData = await verifyContractAndRecordDB({
                chainId,
                apiKey: 'A_MOCK_APIKEY_TO_TRY_TO_GET_VERIFY', // try to get same bytecode, that contract unnecessary to verify
                contractAddress,
                constructorArguements: constructorArguements.replace('0x', ''), // must remove 0x
                updateDB: false,
              });
              verified = verifyData.verified;
            } catch (error) {
              logger.error('try to verify contract error:', error);
            }

            // save contract address
            const contractItem = await Contract.insert({
              _id: chainId,
              contractAddress,
              messageList: [getContractMessageByReceipt({ receipt, index, message })],
              verified,
            });

            logger.info('contract.db.create', contractItem);
          })
          .catch((err) => logger.error('deploy contract tx error:', { error: err }));
      }

      return {
        hash,
      };
    }

    throw new Error('Unsupported wallet type');
  },
};
