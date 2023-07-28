const Database = require('@blocklet/sdk/lib/database');
const cloneDeep = require('lodash/cloneDeep');

/**
 * Data structure
 * - _id: string, the chain id
 * - contractAddress: string, the contract address
 * - verified: boolean, is contract verified
 */

class Contract extends Database {
  constructor() {
    super('contract');
  }

  async create(nft) {
    const result = await this.insert(nft);
    return result;
  }

  async getAllData() {
    const result = await this.cursor({}).sort({ updatedAt: -1 }).exec();
    return result;
  }

  async pagination({ query, sort, offset, limit }) {
    // eslint-disable-next-line implicit-arrow-linebreak
    return new Promise((resolve, reject) => {
      this.cursor(query)
        .sort(sort)
        .skip(offset)
        .limit(limit)
        .exec((err, docs) => {
          if (err) {
            return reject(err);
          }
          return resolve(cloneDeep(docs));
        });
    });
  }
}

module.exports = new Contract();
