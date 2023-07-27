const { readFileSync } = require('fs');
const path = require('path');
const LRUCache = require('lru-cache');
const { Path } = require('path-parser');
const Mustache = require('mustache');
const qs = require('qs');
const logger = require('../libs/logger');
const env = require('../libs/env');

const cache = new LRUCache({
  max: 100,
  ttl: 1000 * 60 * 5,
});

const openGraph = ({ staticDir, fileName = 'index.html', useCache = true } = {}) => {
  return async (req, res, next) => {
    const reqPath = req.path;
    const basePathCheck = new Path('/:pathname<mint|factory|nft>');
    const baseCheckResult = basePathCheck.partialTest(reqPath);
    const isOpenGraph =
      (req.method === 'GET' || req.method === 'HEAD') && (baseCheckResult?.pathname || ['/'].includes(reqPath));
    try {
      // only match pathname will add open graph
      if (isOpenGraph) {
        const template = readFileSync(path.join(staticDir || '', fileName || '')).toString();
        const url = req.originalUrl;
        let html = useCache && cache.get(url);
        if (!html) {
          const og = {
            title: env.appName,
            description: env.appDescription,
            embed: '/api/embed',
          };
          const idPathCheck = new Path('/:pathname<mint|factory|nft>/:id');
          const idCheckResult = idPathCheck.partialTest(reqPath);
          const embedQuery = {
            pathname: 'factory', // pathname default is factory
            ...baseCheckResult,
            ...idCheckResult,
          };

          html = Mustache.render(template, {
            ogTitle: og?.title || 'Inscription',
            ogDescription: og?.description || 'A blocklet that lets you write inscriptions on chains.',
            ogImage: og?.image || '',
            ogEmbed: `${og?.embed}?${qs.stringify(embedQuery)}`,
          });
          cache.set(url, html);
        }

        res.send(html);
      } else {
        next();
      }
    } catch (error) {
      logger.error('open graph error: ', error);
      next();
    }
  };
};

module.exports = openGraph;
