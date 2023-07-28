import flat from 'flat';

export default flat({
  common: {
    inputPlaceholder: '请输入新的消息',
    noDataTip: '暂无数据，请点击下方记录新的消息',
    betaChain: '测试链',
  },
  create: {
    auth: {
      title: '确认部署智能合约',
      scan: '使用您的 DID Wallet 扫描下面的二维码以完成部署',
      confirm: '使用 DID Wallet 确认',
      success: '成功',
    },
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
