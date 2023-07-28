import flat from 'flat';

export default flat({
  common: {
    inputPlaceholder: 'Please input a new message...',
    noDataTip: 'Please record a new message on the bottom',
    betaChain: 'Testnet',
    setChainFailureTip: 'Switching chain failure, please try again',
    useDIDWallet: 'DID Wallet',
    cancel: 'Cancel',
    confirm: 'Confirm',
    apiKey: 'API Key',
    apiKeyTip:
      'You need to use API Key to verify the contract<br/>You can get your exclusive API Key at <a href="{explorer}" style="color: {color};" target="_blank">{explorer}</a>',
    verifyContract: 'Verify Contract',
    unknownError: 'Unknown Error',
  },
  create: {
    auth: {
      title: 'Confirm To Deploy Smart Contract',
      scan: 'Use your DID Wallet to scan the QR code below to complete the deploy',
      confirm: 'Use your DID Wallet to confirm',
      success: 'Success',
    },
    mustUseDIDWalletTip:
      'Deploying a contract requires a DID Wallet signature to ensure that you are the owner of the Blocklet with the contract and that you can interact with all wallets with the same address after deployment.',
  },
  record: {
    auth: {
      title: 'Confirm To Record A New Message',
      scan: 'Use your DID Wallet to scan the QR code below to complete the record',
      confirm: 'Use your DID Wallet to confirm',
      success: 'Success',
    },
  },
});
