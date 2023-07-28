import flat from 'flat';

export default flat({
  common: {
    inputPlaceholder: '请输入新的消息...',
    noDataTip: '暂无数据，请在下方记录新的消息',
    betaChain: '测试链',
    setChainFailureTip: '切换链失败，请重试',
    useDIDWallet: 'DID Wallet',
    cancel: '取消',
    confirm: '确认',
    apiKey: 'API Key',
    apiKeyTip:
      '需要使用 API Key 才能校验合约<br/>您可以到 <a href="{explorer}" style="color: {color};" target="_blank">{explorer}</a> 获取您的专属 API Key',
    verifyContract: '校验合约',
    unknownError: '未知错误',
  },
  create: {
    auth: {
      title: '确认部署智能合约',
      scan: '使用您的 DID Wallet 扫描下面的二维码以完成部署',
      confirm: '使用 DID Wallet 确认',
      success: '成功',
    },
    mustUseDIDWalletTip:
      '部署合约需要使用 DID Wallet 签名，以确保您是 Blocklet 与合约的所有者，部署后您可以使用相同地址的各种钱包进行交互。',
  },
  record: {
    auth: {
      title: '确认记录新的消息',
      scan: '使用您的 DID Wallet 扫描下面的二维码以完成记录',
      confirm: '使用 DID Wallet 确认',
      success: '成功',
    },
  },
});
