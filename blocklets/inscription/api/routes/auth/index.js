const { handlers } = require('../../libs/auth');
const deployContractHandler = require('./deploy-contract');
const recordMessageHandler = require('./record-message');

module.exports = {
  init(app) {
    handlers.attach({ app, ...deployContractHandler });
    handlers.attach({ app, ...recordMessageHandler });
  },
};
