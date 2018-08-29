export const ETHERSCAN_TX = txHash =>
  `https://api-ropsten.etherscan.io/api?module=transaction&action=gettxreceiptstatus&txhash=${txHash}`;
