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
    apiKeyNotEmptyTip: 'API Key is required',
    apiKeyTip:
      '* If the contract has already been verified with similar code in the block explorer, there is no need to repeat the operation<br/>* Verifying the contract requires an API Key, which you can get from <a href="{explorer}" style="color: {color};" target="_blank">{explorer}</a>. Proprietary API Key',
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
