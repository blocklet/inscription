const path = require('path');
const AuthStorage = require('@arcblock/did-auth-storage-nedb');
const getWallet = require('@blocklet/sdk/lib/wallet');
const WalletAuthenticator = require('@blocklet/sdk/lib/wallet-authenticator');
const WalletHandler = require('@blocklet/sdk/lib/wallet-handler');
const GraphQLClient = require('@ocap/client');
const { Auth } = require('@blocklet/sdk');
const env = require('./env');

const authClient = new Auth();
const getOwnerDid = () =>
  authClient.getOwner().then((res) => {
    return res?.user?.did;
  });

const client = new GraphQLClient(env.chainHost);

const wallet = getWallet();
const ethWallet = getWallet.getEthereumWallet();
const authenticator = new WalletAuthenticator();
const handlers = new WalletHandler({
  authenticator,
  tokenStorage: new AuthStorage({
    dbPath: path.join(env.dataDir, 'auth.db'),
  }),
});

module.exports = {
  authenticator,
  handlers,
  wallet,
  ethWallet,
  client,
  getOwnerDid,
};
