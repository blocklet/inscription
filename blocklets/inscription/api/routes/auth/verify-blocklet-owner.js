const { fromPublicKey } = require('@ocap/wallet');
const { toTypeInfo } = require('@arcblock/did');
const logger = require('../../libs/logger');
const { getOwnerDid } = require('../../libs/auth');
const { api } = require('../../libs/request');

module.exports = {
  action: 'verify-blocklet-owner',
  claims: [
    {
      signature: async ({ userDid }) => {
        const ownerDid = await getOwnerDid();

        logger.info({ ownerDid, userDid });

        if (userDid !== ownerDid) {
          throw new Error('Only blocklet owner can use it');
        }

        return {
          description: 'Please sign the transaction to verify blocklet owner',
          type: 'mime:text/plain',
          data: 'I am the owner of the blocklet and I want to continue the operation',
        };
      },
    },
  ],
  // `nw` is ABBR for `nextWorkflow`
  onAuth: async ({ userDid, userPk, extraParams, claims }) => {
    const type = toTypeInfo(userDid);
    const wallet = fromPublicKey(userPk, type);
    const claim = claims.find((x) => x.type === 'signature');

    if (claim.origin) {
      if (wallet.verify(claim.origin, claim.sig, claim.method !== 'none') === false) {
        throw new Error('Signature is invalid!');
      }
    }

    const { nwUrl } = extraParams;
    const { data } = await api.get(nwUrl);

    return {
      nextWorkflow: data.url,
    };
  },
};
