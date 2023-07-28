import flat from 'flat';

export default flat({
  common: {
    inputPlaceholder: 'Please input a new message',
    noDataTip: 'Please click the button on the bottom to record a new message',
    betaChain: 'Testnet',
  },
  create: {
    auth: {
      title: 'Confirm To Deploy Smart Contract',
      scan: 'Use your DID Wallet to scan the QR code below to complete the deploy',
      confirm: 'Use your DID Wallet to confirm',
      success: 'Success',
    },
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
