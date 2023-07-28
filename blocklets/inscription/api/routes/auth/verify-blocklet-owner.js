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
  onAuth: async ({ extraParams }) => {
    // FIXME: should use signature to verify the user
    const { nwUrl } = extraParams;
    const { data } = await api.get(nwUrl);
    return {
      nextWorkflow: data.url,
    };
  },
};
