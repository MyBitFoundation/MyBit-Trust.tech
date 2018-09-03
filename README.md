# MyBit Trust Dapp 

The Trust Dapp allows users to leave a Trust in the form of Ether for a chosen beneficiary after a chosen amount of time, measured in Ethereum blocks. Users are able to choose the amount of Ether, the length of time and whether or not they want the trust to be revocable. 


### Main-net Contracts

[MyBitBurner](https://etherscan.io/address/0x507ca44958dfd52eda1e2cf4ac368d7553962ea3)

[TrustFactory](https://etherscan.io/address/0xfe03084c34b2dc3a171f9a738f4e478707666f0f)

[MyBit-Token](https://etherscan.io/token/0x5d60d8d7ef6d37e16ebabc324de3be57f135e0bc)

### Ropsten Contracts 

[MyBitBurner](https://ropsten.etherscan.io/address/0x733b124fbf283c32c1e3c59f434d9700d60bf1a4#code)

[TrustFactory](https://ropsten.etherscan.io/address/0x38d07b2f1f6fcc37b80b9ce4c13adf678ca0097e)

[MyBit-Ropsten token](https://ropsten.etherscan.io/address/0xbb07c8c6e7CD15E2E6F944a5C2CAC056c5476151)

# Contracts

# Trust 
The Trust smart-contracts are created through the TrustFactory contract, when deployTrust() is called. 

### Requirements 
* BigNumber.js - `npm install bignumber.js`

* Truffle v4.1.11 (core: 4.1.11)  `npm install -g truffle` 

* Ganache-Cli   `npm install -g ganache-cl`

* Solidity v0.4.24 (solc-js)  `npm install -g solc`

### Testing 
To run tests first in the terminal run `ganache-cli`

* Open another tab in terminal and go to folder `ethereum/tests` 

* Run `truffle compile` 

* Run `truffle test test.js` 

:pencil2:  All contracts are written in Solidity.

# Testing 
* In the terminal run `ganache-cli`  (use -a flag to specify number of accounts ie. -a 20) 
* Open another terminal window and navigate to Contracts/test 
* run `truffle test testFileName.js` 
* NOTE: Make sure bignumber.js is installed.  `npm install bignumber.js`

# Compiling 
* In the terminal run `ganache-cli`  
* In another terminal navigate to /Contracts 
* run `truffle compile` 

# Dependencies 
* bignumber.js   `npm install bignumber.js`
* solidity-docgen  `npm install solidity-docgen`

#### ⚠️ Warning 
This application is unstable and has not undergone any rigorous security audits. Use at your own risk. 
