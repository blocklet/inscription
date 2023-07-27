/* eslint-disable no-underscore-dangle */
const path = require('path');
const createQueue = require('@abtnode/queue');
const env = require('./env');

const createQueueWrapper = ({ onJob, name, options }) =>
  createQueue({
    file: path.join(env.dataDir, `queue/${name}.db`),
    options: {
      id: (d) => d._id,
      concurrency: 5,
      maxRetries: 10,
      ...options,
    },
    onJob,
  });

module.exports = {
  createQueue: createQueueWrapper,
};
