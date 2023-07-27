const flatten = require('flat');

module.exports = flatten({
  common: {},
  sdk: {
    factoryAddressEmpty: '参数 factoryAddress 不能为空',
    factoryNotFound: '没有找到 Factory 相关信息',
  },
});
