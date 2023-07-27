require('dotenv-flow').config();
require('express-async-errors');
const path = require('path');
const cors = require('cors');
const express = require('express');
const cookieParser = require('cookie-parser');
const fallback = require('express-history-api-fallback');
const { name, version } = require('../package.json');
const logger = require('./libs/logger');
const authRoutes = require('./routes/auth');
const openGraph = require('./middlewares/open-graph');

const app = express();

app.set('trust proxy', true);
app.use(cookieParser());
app.use(express.json({ limit: '1 mb' }));
app.use(express.urlencoded({ extended: true, limit: '1 mb' }));

const router = express.Router();
authRoutes.init(router);
router.use('/api', require('./routes'));

const isProduction = process.env.NODE_ENV === 'production' || process.env.ABT_NODE_SERVICE_ENV === 'production';

if (isProduction) {
  app.use(cors());

  app.use(router);
  const staticDir = path.resolve(process.env.BLOCKLET_APP_DIR, 'dist');
  // open graph
  // 注意: 在 API router 后执行
  app.use(openGraph({ staticDir }));

  app.use(express.static(staticDir, { index: 'index.html' }));

  app.use(fallback('index.html', { root: staticDir }));

  app.use((req, res) => {
    res.status(404).send('404 NOT FOUND');
  });
  app.use((err, req, res) => {
    logger.error(err.stack);
    res.status(500).send('Something broke!');
  });
} else {
  app.use(router);
  // open graph test
  // 注意: 测试 og 是否生效用，hack 了一下
  app.use(openGraph({ staticDir: path.resolve(__dirname, '..'), fileName: 'index.html.local', useCache: false }));
}

const port = parseInt(process.env.BLOCKLET_PORT, 10) || 3033;

app.listen(port, (err) => {
  if (err) throw err;
  logger.info(`> ${name} v${version} ready on ${port}`);
});

module.exports = {
  app,
};
