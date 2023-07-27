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

const { getAuthPrincipal } = require('../../libs');

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
            description: 'Please sign the transaction to deploy smart contract',
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
        waitForTxReceipt({ txHash: hash, provider, ownerAddress: userDid })
          .then(async (receipt) => {
            const { logs, contractAddress } = receipt;
            const contract = new ethers.Contract(contractAddress, Inscription.abi, provider);
            const parseLog = logs.map((log) => contract.interface.parseLog(log));
            const { args = [] } = parseLog?.find((item) => item.name === 'RecordedMessage') || {};
            const index = args[0]?.toString();
            const message = args[1]?.toString();

            logger.info('deploy contract tx receipt:', {
              receipt,
              parseLog,
              contractAddress,
              result: {
                index,
                message,
              },
            });

            // save contract address
            const chainItem = await Contract.insert({
              _id: chainId,
              contractAddress,
            });

            logger.info('chain.db.create', chainItem);
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
