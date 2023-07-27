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
const logger = require('../../libs/logger');
const { getOwnerDid } = require('../../libs/auth');
const { getAuthPrincipal } = require('../../libs');

module.exports = {
  action: 'record-message',
  claims: [
    {
      authPrincipal: getAuthPrincipal,
    },
    {
      signature: async ({ userDid, extraParams }) => {
        const { chainId, message, contractAddress } = extraParams;
        const isETHWalletType = isEthereumDid(userDid);
        const ownerDid = await getOwnerDid();

        logger.info({ isETHWalletType, chainId, message, ownerDid });

        if (isETHWalletType) {
          // if (userDid !== ownerDid) {
          //   throw new Error('Only owner can record message');
          // }

          const provider = await getProvider(chainId);
          const contract = new ethers.Contract(contractAddress, Inscription.abi, provider);

          const contractFactory = await createContractFactory({
            abi: Inscription.abi,
            bytecode: Inscription.bytecode,
          });

          const bytecode = contractFactory.getDeployTransaction(message).data;

          // estimatedGas use deploy bytecode, avoid recordMessage onlyOwner modifier
          const estimatedGas = await provider.estimateGas({
            data: bytecode,
          });

          const txData = await getTxData({
            contract,
            gasLimit: Math.ceil(estimatedGas * 1.5).toString(), // add 50% gasLimit
            fn: 'recordMessage',
            args: [message],
            value: '0',
          });

          return {
            description: 'Please sign the transaction to record message',
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

            logger.info('deploy contract tx receipt:', {
              receipt,
              parseLog,
              contractAddress,
              result: {
                index,
                message,
              },
            });
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
