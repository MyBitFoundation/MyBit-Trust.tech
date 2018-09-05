# MyBit Trust
[![CircleCI](https://circleci.com/gh/MyBitFoundation/MyBit-Trust.tech.svg?style=shield)](https://circleci.com/gh/MyBitFoundation/MyBit-Trust.tech) [![Coverage Status](https://coveralls.io/repos/github/MyBitFoundation/MyBit-Trust.tech/badge.svg?branch=feature%2Fcoverage)](https://coveralls.io/github/MyBitFoundation/MyBit-Trust.tech?branch=feature%2Fcoverage)

The Trust Dapp allows users to leave a [Trust](https://www.investopedia.com/terms/t/trust-fund.asp) in the form of Ether for a chosen beneficiary after a chosen amount of time, measured in Ethereum blocks. Users are able to choose the amount of Ether, the length of time and whether or not they want the trust to be revocable.


## Main-net Contracts

* [MyBitBurner](https://etherscan.io/address/0x507ca44958dfd52eda1e2cf4ac368d7553962ea3)
* [TrustFactory](https://etherscan.io/address/0xfe03084c34b2dc3a171f9a738f4e478707666f0f)
* [MyBit-Token](https://etherscan.io/token/0x5d60d8d7ef6d37e16ebabc324de3be57f135e0bc)

## Ropsten Contracts

* [MyBitBurner](https://ropsten.etherscan.io/address/0x733b124fbf283c32c1e3c59f434d9700d60bf1a4#code)
* [TrustFactory](https://ropsten.etherscan.io/address/0x38d07b2f1f6fcc37b80b9ce4c13adf678ca0097e)
* [MyBit-Ropsten token](https://ropsten.etherscan.io/address/0xbb07c8c6e7CD15E2E6F944a5C2CAC056c5476151)

# Contracts

The Trust smart-contracts are created through the TrustFactory contract, when `deployTrust()` is called.

## Setup

Install dependencies.

`yarn`

## Testing

Bootstrap [Ganache](https://truffleframework.com/ganache)

`yarn blockchain`

Run tests

`yarn test`

✏️ All contracts are written in [Solidity](https://solidity.readthedocs.io/en/v0.4.24/) version 0.4.24.

## Code Coverage

Download solidity-coverage locally

`npm install --save-dev solidity-coverage`

Run solidity-coverage

`./node_modules/.bin/solidity-coverage`

Coverage reports can be accessed at 'coverage/index.html'

## Compiling

`yarn compile`

## Documentation

```
cd docs/website
yarn build
```

To publish to GitHub Pages

```
cd docs/website
GIT_USER=<GIT_USER> \
  USE_SSH=true \
  yarn run publish-gh-pages
```

### ⚠️ Warning
This application is unstable and has not undergone any rigorous security audits. Use at your own risk.
