/* eslint-disable import/prefer-default-export */
const get = require('lodash/get');
const en = require('./en');
const zh = require('./zh');

module.exports = (key, locale = 'en') => {
  return get({ zh, en }, [locale, key], key);
};
