const getAuthPrincipal = async ({ extraParams }) => {
  const { chainId } = extraParams;
  if (chainId) {
    return {
      chainInfo: {
        type: 'ethereum',
        id: chainId, // string
        host: 'none', // must
      },
    };
  }

  return {
    chainInfo: {
      type: 'ethereum',
      id: '1', // string
      host: 'none', // must
    },
  };
};

module.exports = {
  getAuthPrincipal,
};
