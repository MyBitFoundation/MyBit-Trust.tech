const fs = require('fs');
const bn = require('bignumber.js');
const SafeMath = artifacts.require("./SafeMath.sol");
const Token = artifacts.require("./token/ERC20.sol");
const Trust = artifacts.require("./Trust.sol");
const TrustFactory = artifacts.require("./TrustFactory.sol");
const MyBitBurner = artifacts.require("./MyBitBurner.sol");

module.exports = function(deployer, network, accounts) {
  const WEI = 10**18;
  const tokenSupply = 100000000*WEI;      // 100 million

  var myb, erc20, trust, trustFactory, burner;

  deployer.then(function(){

    return deployer.deploy(SafeMath);

  }).then(function(){

    //Link safemath library
    deployer.link(SafeMath,
                  Token,
                  Trust,
                  MyBitBurner);

    return Token.new(tokenSupply, "MyBit", 18, "MYB");

  }).then(function(instance) {

    myb = instance;
    for(var i=1; i<accounts.length; i++){
      myb.transfer(accounts[i], 10000*WEI);
    }
    myb.transfer("0xc227D2476688001D55957399B418b6fDa18254E7", 10000*WEI);

    return Token.new(tokenSupply, "TestERC20", 18, "ERC20");

  }).then(function(instance) {

    erc20 = instance;
    for(var i=1; i<accounts.length; i++){
      erc20.transfer(accounts[i], 10000*WEI);
    }
    erc20.transfer("0xc227D2476688001D55957399B418b6fDa18254E7", 10000*WEI);

    return MyBitBurner.new(myb.address);

  }).then(function(instance) {

    burner = instance;
    return TrustFactory.new(burner.address);

  }).then(function(instance) {

    trustFactory = instance;
    return burner.authorizeBurner(trustFactory.address);

  }).then(function() {
    web3.eth.sendTransaction({from:accounts[0], to:"0xc227D2476688001D55957399B418b6fDa18254E7", value:10*WEI});

    var addresses = {
      "MyBitToken" : myb.address,
      "ERC20Token" : erc20.address,
      "MyBitBurner" : burner.address,
      "TrustFactory" : trustFactory.address
    };

    var contracts_json = JSON.stringify(addresses, null, 4);
    var accounts_json = JSON.stringify(accounts, null, 4);
    fs.writeFile('networks/' + network + '/contracts.json', contracts_json, (err) => {
      if (err) throw err;
      console.log('Contracts Saved');
    });
    fs.writeFile('networks/' + network + '/accounts.json', accounts_json, (err) => {
      if (err) throw err;
      console.log('Accounts Saved');
    });

    var instanceList = [{name:"MyBitToken", instance:myb}, {name:"ERC20", instance:erc20}, {name:"MyBitBurner", instance:burner}, {name:"TrustFactory", instance:trustFactory}];

    for(var i=0; i<instanceList.length; i++){
      var instance_js =
        "export const ADDRESS = '" + instanceList[i].instance.address + "'; \n" +
        "export const ABI = " + JSON.stringify(instanceList[i].instance.abi, null, 4) + ";";
      fs.writeFile('networks/' + network + '/' + instanceList[i].name + '.js', instance_js, (err) => {
        if (err) throw err;
      });
    }
    console.log('JS Saved');
  });
};

