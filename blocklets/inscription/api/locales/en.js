const flatten = require('flat');

module.exports = flatten({
  common: {},
  sdk: {
    factoryAddressEmpty: 'FactoryAddress can not be empty',
    factoryNotFound: 'Factory is not exist',
  },
});
