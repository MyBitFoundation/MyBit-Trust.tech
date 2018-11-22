var bn = require('bignumber.js');

/* Contracts  */
const Token = artifacts.require("./token/ERC20.sol");
const Trust = artifacts.require("./Trust.sol");
const TrustFactory = artifacts.require("./TrustFactory.sol");
const MyBitBurner = artifacts.require("./MyBitBurner.sol");

const WEI = 1000000000000000000;

contract('Trust - Deploying and storing all contracts + validation', async (accounts) => {
  const owner = web3.eth.accounts[0];
  const trustor = web3.eth.accounts[1];
  const beneficiary = web3.eth.accounts[2];
  const beneficiary2 = web3.eth.accounts[3];
  const beneficiary3 = web3.eth.accounts[4];
  const beneficiaries = [beneficiary, beneficiary2, beneficiary3];
  const thief = web3.eth.accounts[9];

  const tokenSupply = 180000000000000000000000000;
  const tokenPerAccount = 1000000000000000000000;

  let burnFee = 250000000000000000000;
  let numTrustsMade = 0;

  let originalBeneficiary; //Original beneficiary

  // Contract instances
  let token; // Token contract instance
  let trust;   // Trust contract instance
  let trustFactory;  // TrustFactory contract instance
  let myBitBurner;   // MyBitBurner contract instance


  // Contract addresses
  let tokenAddress;
  let burnerAddress;


  // Deploy token contract
  it ('Deploy MyBit Token contract', async() => {
    token = await Token.new(tokenSupply, "MyBit", 18, "MYB");
    tokenAddress = await token.address;
    console.log(tokenAddress);

    assert.equal(await token.totalSupply(), tokenSupply);
    assert.equal(await token.balanceOf(owner), tokenSupply);
  });

  // Give every user tokenPerAccount amount of tokens
  it("Spread tokens to users", async () => {
    for (var i = 1; i < web3.eth.accounts.length; i++) {
      //console.log(web3.eth.accounts[i]);
      await token.transfer(web3.eth.accounts[i], tokenPerAccount);
      let userBalance = await token.balanceOf(web3.eth.accounts[i]);
      assert.equal(userBalance, tokenPerAccount);
    }
    // Check token ledger is correct
    let totalTokensCirculating = (web3.eth.accounts.length - 1) * (tokenPerAccount);
    let remainingTokens = bn(tokenSupply).minus(totalTokensCirculating);
    let ledgerTrue = bn(await token.balanceOf(owner)).eq(remainingTokens);
    assert.equal(ledgerTrue, true);
  });

  it ('Deploy MyBitBurner contract', async() => {
    myBitBurner = await MyBitBurner.new(tokenAddress);
    burnerAddress = await myBitBurner.address;
    assert.equal(await myBitBurner.owner(), web3.eth.accounts[0]);
    console.log(burnerAddress);
  });

  it ('Deploy TrustFactory contract', async() => {
    trustFactory = await TrustFactory.new(burnerAddress);
    assert.equal(await trustFactory.mybFee(), burnFee);
    tfAddress = await trustFactory.address;
    console.log(tfAddress);
    await myBitBurner.authorizeBurner(tfAddress);
    let authTrue = await myBitBurner.authorizedBurner(tfAddress);
    assert.equal(true, authTrue);
  });

  it('Fail to change MyB Fee', async() => {
    try{
      await trustFactory.changeMYBFee(200000000000000000000, {from: trustor});
    }catch(e){
      console.log('Only owner can change MyB fee');
    }
  });

  it('Change MyB Fee', async() => {
    burnFee = 200000000000000000000;
    await trustFactory.changeMYBFee(burnFee);
  });

  it('Fail to deploy trust', async() => {
    try{
      await trustFactory.deployTrust(beneficiary, true, 4, {from: trustor});
    }catch(e){
      console.log('No money given to trust');
    }
  });

  it('Fail to deploy trust', async() => {
    try{
      await trustFactory.deployTrust(beneficiary, true, 4, {from: trustor, value: (2 * WEI) });
    }catch(e){
      console.log('No permission given to burn MyB tokens');
    }
  });

  it('Deploy Trust contract', async() => {
    let balanceStart = await web3.eth.getBalance(trustor);
    console.log('Balance at Start: ' + balanceStart);

    //Give MyBitBurner permission to handle user tokens (limit burnFee)
    await token.approve(burnerAddress, burnFee, {from: trustor});
    let trustExpiration = 6;
    tx = await trustFactory.deployTrust(beneficiary, true, trustExpiration, {from: trustor, value: (2 * WEI) });
    numTrustsMade += 1;
    trustAddress = tx.logs[0].args._trustAddress;
    console.log('Trust Address: ' + trustAddress);

    //Confirm burnt tokens
    let userBalance = await token.balanceOf(trustor);
    console.log(Number(userBalance));
    console.log(tokenPerAccount - burnFee);

    let expectedTokenBalance = bn(tokenPerAccount).minus(burnFee);
    let tokenBalanceTrue = bn(expectedTokenBalance).eq(userBalance);
    assert.equal(tokenBalanceTrue, true);

    //Instantiate deployed trust contract
    trust = await Trust.at(trustAddress);

    //Check trust
    assert.equal(trustor, await trust.trustor());
    assert.equal(beneficiary, await trust.beneficiary());
    assert.equal((2 * WEI), await trust.trustBalance());
    let expiration = await trust.expiration();
    let blockNumber = await web3.eth.getBlock('latest').number;
    assert.equal(blockNumber + trustExpiration, expiration);
    assert.equal(trustExpiration-1, await trust.blocksUntilExpiration());
  });

  it('Fail to pay trust factory contract', async() => {
    try{
      await web3.eth.sendTransaction({from:trustor,to:trustFactory.address, value:0.1*WEI});
    }catch(e){
      console.log('Cannot send money directly to a trust factory contract');
    }
  });

  it('Fail to pay trust contract', async() => {
    try{
      await web3.eth.sendTransaction({from:trustor,to:trustAddress, value:0.1*WEI});
    }catch(e){
      console.log('Cannot send money directly to a trust contract');
    }
  });

  it('Revoke Trust', async() => {
    let balanceBefore = await web3.eth.getBalance(trustor);
    let beforeExpirationTrue = bn(await trust.expiration()).gt(await web3.eth.getBlock('latest').number);
    assert.equal(beforeExpirationTrue, true);

    // Revoke trust
    tx = await trust.revoke({from: trustor});
    console.log('Trust Revoked');
    console.log(tx.logs[0].args);

    // Check variables
    let balanceAfter = await web3.eth.getBalance(trustor);   // TODO: should get actual gas used in the transaction
    assert.equal(bn(balanceBefore).lt(balanceAfter), true);
  });

   it ('Make sure Trust contract is destroyed', async() => {
     let err;
     try {await trust.changeExpiration(0, {from: trustor});}
     catch(e) {
         err = e;
     }
     assert.notEqual(err, undefined);

     // Try Withdrawing
     err = undefined;
     try { await trust.withdraw({from: beneficiary});  }
     catch(e) {
         console.log("EVM error: No income left in trust");
         err = e;
     }
     assert.notEqual(err, undefined);
  });

  it('Deploy New Trust contract', async() => {
    //Give MyBitBurner permission to handle user tokens (limit burnFee)
    await token.approve(burnerAddress, burnFee, {from: trustor});
    //Use trustFactory to deploy trust
    tx = await trustFactory.deployTrust(beneficiary, true, 10, {from: trustor, value: (2 * WEI) });
    numTrustsMade += 1;
    trustAddress = tx.logs[0].args._trustAddress;
    console.log('Trust Address: ' + trustAddress);

    //Confirm burnt tokens
    let userBalance = await token.balanceOf(trustor);
    let trustMYBBurnt = bn(burnFee).times(numTrustsMade);
    let balanceCheck = bn(tokenPerAccount).minus(trustMYBBurnt);
    assert.equal(bn(userBalance).eq(balanceCheck), true);

    //Instantiate deployed trust contract
    trust = await Trust.at(trustAddress);

    //console.log(await trust.expiration());
    assert.equal(trustor, await trust.trustor());
    assert.equal(beneficiary, await trust.beneficiary());
    assert.equal((2 * WEI), await trust.trustBalance());
  });

  it('Attemp to deposit in trust', async() => {
    try{
      await trust.depositTrust({value: WEI});
    }catch(e){
      console.log('Money already deposited in trust')
    }
  });

  it('Fail to change beneficiary', async() => {
    try{
      await trust.changeBeneficiary('', {from: trustor});
    }catch(e){
      console.log('Cant change beneficiary to empty address')
    }
  });

  it('Change Beneficiary', async() => {
    originalBeneficiary = await trust.beneficiary();
    console.log('Old Beneficiary: ' + originalBeneficiary);

    //Change beneficiary to the trustor
    await trust.changeBeneficiary(beneficiary2, {from: trustor});
    currentBeneficiary = await trust.beneficiary()
    console.log('New Beneficiary: ' + currentBeneficiary);
    assert.equal(beneficiary2, currentBeneficiary);
  });

  it("Expect expiration change to fail", async() => {
    let err;
    try { await trust.changeExpiration(-1, {from: trustor}); }
    catch(e) { err = e;  }
    assert.notEqual(err, null);
  });

  it("Expect withdraw to fail: Expiration", async() => {
    let err;
    try { await trust.withdraw({from: currentBeneficiary}); }
    catch(e) { err = e; }
    assert.notEqual(err, null);
  });

  it('Change Expiration', async() => {
    let blockNumber = await web3.eth.getBlock('latest').number;
    let expirationBefore = await trust.expiration();
    //Change expiration to 0
    await trust.changeExpiration(0, {from: trustor});
    blockNumber = await web3.eth.getBlock('latest').number;
    let expirationAfter = await trust.expiration();
    assert.equal(0, await trust.blocksUntilExpiration());
  });

  it("Expect withdraw to fail: Wrong Beneficiary", async() => {
    let err;
    try { await trust.withdraw({from: originalBeneficiary}); }
    catch(e) { err = e;  }
    assert.notEqual(err, null);
  });

  it('Withdraw', async() => {
    let balanceBefore = await web3.eth.getBalance(currentBeneficiary);
    let valueOfTrustBefore = await trust.trustBalance();
    console.log('Balance Before: ' + balanceBefore);
    console.log('Trust Before: ' + valueOfTrustBefore);

    //Widthdraw
    assert.equal(await trust.blocksUntilExpiration(), 0);
    await trust.withdraw({from: currentBeneficiary});

    // Check variables
    let balanceAfter = await web3.eth.getBalance(currentBeneficiary);   // TODO: should get actual gas used in the transaction
    console.log('Balance After: ' + balanceAfter);
    assert.equal(bn(balanceBefore).lt(balanceAfter), true);
  });

  it("Expect withdraw to fail: Trust already withdrawn", async() => {
    let err;
    try { await trust.withdraw({from: currentBeneficiary}); }
    catch(e) { err = e; }
    assert.notEqual(err, null);
  });

  it('Try to deploy New Trust with no Ether', async() => {
    //Give MyBitBurner permission to handle user tokens (limit burnFee)
    await token.approve(burnerAddress, burnFee, {from: trustor});
    //Use trustFactory to deploy trust
    let err;
    try { await trustFactory.deployTrust(beneficiary, false, 10, {from: trustor}); }
    catch(e) { err = e; }
    assert.notEqual(err, null);
  });

  it('Change MYB Fee', async() => {
    let newFee = 1;
    let trustorBalanceBefore = await token.balanceOf(trustor);

    await trustFactory.changeMYBFee(newFee);
    assert.equal(await trustFactory.mybFee(), newFee);
    //Give MyBitBurner permission to handle user tokens (limit burnFee)
    await token.approve(burnerAddress, burnFee, {from: trustor});
    //Use trustFactory to deploy trust
    tx = await trustFactory.deployTrust(beneficiary, false, 20, {from: trustor, value: (2 * WEI) });
    //Confirm burnt tokens
    let userBalance = await token.balanceOf(trustor);
    assert.equal(bn(userBalance).eq(bn(trustorBalanceBefore).minus(newFee)), true);

    await trustFactory.changeMYBFee(burnFee);
    assert.equal(await trustFactory.mybFee(), burnFee);
  });

  it('Deploy New Trust contract', async() => {
    let trustorBalanceBefore = await token.balanceOf(trustor);
    await token.approve(burnerAddress, burnFee, {from: trustor});
    //Use trustFactory to deploy trust
    tx = await trustFactory.deployTrust(beneficiary, false, 20, {from: trustor, value: (2 * WEI) });
    trustAddress = tx.logs[0].args._trustAddress;
    console.log('Trust Address: ' + trustAddress);

    //Confirm burnt tokens
    let userBalance = await token.balanceOf(trustor);
    assert.equal(bn(userBalance).eq(bn(trustorBalanceBefore).minus(burnFee)), true);

    //Instantiate deployed trust contract
    trust = await Trust.at(trustAddress);

    //console.log(await trust.expiration());
    assert.equal(trustor, await trust.trustor());
    assert.equal(beneficiary, await trust.beneficiary());
    assert.equal((2 * WEI), await trust.trustBalance());
  });

  it('Try to revoke trust from different account', async() => {
    let err;
    try { await trust.revoke({from: beneficiary}); }
    catch(e) { err = e; }
    assert.notEqual(err, null);
  });

  it('Try to deposit trust for a second time', async() => {
    let err;
    try { await trust.depositTrust({from: trustor, value: 1 * WEI}); }
    catch(e) { err = e; }
    assert.notEqual(err, null);
  })

  it("try to revoke on non revokable contract", async() => {
    let err;
    try { await trust.revoke({from: trustor}); }
    catch(e) { err = e; }
    assert.notEqual(err, null);
  });

  // Test  MyBitBurner

  it('Remove TrustFactory as burner', async() => {
    assert.equal(true, await myBitBurner.authorizedBurner(trustFactory.address));
    await myBitBurner.removeBurner(trustFactory.address);
    assert.equal(false, await myBitBurner.authorizedBurner(trustFactory.address));
  });

  it('Try to add TrustFactory as non-owner', async() => {
    let err;
    try { await myBitBurner.authorizeBurner(trustFactory.address, {from: trustor}); }
    catch(e) { err = e; }
    assert.notEqual(err, null);
    // Add it back
    await myBitBurner.authorizeBurner(trustFactory.address);
    assert.equal(true, await myBitBurner.authorizedBurner(trustFactory.address));
  });

  it('Try to remove trustFactory as non-owner', async() => {
    let err;
    try { await myBitBurner.removeBurner(trustFactory.address, {from: trustor}); }
    catch(e) { err = e; }
    assert.notEqual(err, null);
  });

  it ("Try to close trustFactory as non-owner", async() => {
    let err;
    try { await trustFactory.closeFactory({from: trustor}); }
    catch(e) { err = e; }
    assert.notEqual(err, null);
  });

  it("Close contract factory", async() => {
    await trustFactory.closeFactory();
    assert.equal(true, await trustFactory.expired());
  });

  it('Fail to close factory', async() => {
    try {
      await trustFactory.closeFactory();
    }catch(e) {
      console.log('Factory is already closed');
    }
  });

  it("Try to deploy another trust when factory is closed", async() => {
    let err;
    try { await trustFactory.deployTrust(beneficiary, false, 20, {from: trustor, value: (2 * WEI) }); }
    catch(e) { err = e; }
    assert.notEqual(err, null);
  });

});

function advanceBlock () {
  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      jsonrpc: '2.0',
      method: 'evm_mine',
      id: Date.now(),
    }, (err, res) => {
      return err ? reject(err) : resolve(res);
    });
  });
}
