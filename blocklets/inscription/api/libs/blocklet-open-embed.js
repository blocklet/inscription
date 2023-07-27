function generateBlockletEmbed(req) {
  const { BLOCKLET_APP_NAME, BLOCKLET_APP_URL } = process.env;
  const prefix = req.headers?.['x-path-prefix'] || '/';

  const name = BLOCKLET_APP_NAME;
  const url = prefix;

  return {
    name,
    url,
    origin: BLOCKLET_APP_URL,
    embed: [],
  };
}

module.exports = {
  generateBlockletEmbed,
};
