var bn = require('bignumber.js');

/* Contracts  */
const Token = artifacts.require("./token/ERC20.sol");
const Trust = artifacts.require("./TrustERC20.sol");
const TrustFactory = artifacts.require("./TrustFactory.sol");
const MyBitBurner = artifacts.require("./MyBitBurner.sol");

const WEI = 1000000000000000000;

contract('Trust - Using ERC20 Token', async (accounts) => {
  const owner = web3.eth.accounts[0];
  const trustor = web3.eth.accounts[1];
  const beneficiary = web3.eth.accounts[2];
  const beneficiary2 = web3.eth.accounts[3];
  const beneficiary3 = web3.eth.accounts[4];
  const beneficiaries = [beneficiary, beneficiary2, beneficiary3];

  const tokenSupply = 180000000000000000000000000;
  const tokenPerAccount = 1000000000000000000000;

  let burnFee = 250000000000000000000;
  let numTrustsMade = 0;

  let originalBeneficiary; //Original beneficiary

  // Contract instances
  let token; // Token contract instance
  let erc20; // ERC20 contract instance
  let trust;   // Trust contract instance
  let trustFactory;  // TrustFactory contract instance
  let myBitBurner;   // MyBitBurner contract instance


  // Contract addresses
  let tokenAddress;
  let erc20Address;
  let burnerAddress;

  // Deploy token contract
  it ('Deploy MyBit Token contract', async() => {
    token = await Token.new(tokenSupply, "MyBit", 18, "MYB");
    tokenAddress = await token.address;
    // console.log(tokenAddress);

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

  // Deploy token contract
  it ('Deploy ERC20 Token contract', async() => {
    erc20 = await Token.new(tokenSupply, "ERC20", 18, "ERC");
    erc20Address = await erc20.address;
    // console.log(erc20Address);

    assert.equal(await erc20.totalSupply(), tokenSupply);
    assert.equal(await erc20.balanceOf(owner), tokenSupply);
  });

  // Give every user tokenPerAccount amount of tokens
  it("Spread ERC20 tokens to users", async () => {
    for (var i = 1; i < web3.eth.accounts.length - 1; i++) {
      await erc20.transfer(web3.eth.accounts[i], tokenPerAccount);
      let userBalance = await erc20.balanceOf(web3.eth.accounts[i]);
      assert.equal(userBalance, tokenPerAccount);
    }
    // Check token ledger is correct
    let totalTokensCirculating = (web3.eth.accounts.length - 2) * (tokenPerAccount);
    let remainingTokens = bn(tokenSupply).minus(totalTokensCirculating);
    let ledgerTrue = bn(await erc20.balanceOf(owner)).eq(remainingTokens);
    assert.equal(ledgerTrue, true);
  });

  it ('Deploy MyBitBurner contract', async() => {
    myBitBurner = await MyBitBurner.new(tokenAddress);
    burnerAddress = await myBitBurner.address;
    assert.equal(await myBitBurner.owner(), web3.eth.accounts[0]);
    // console.log(burnerAddress);
  });

  it ('Deploy TrustFactory contract', async() => {
    trustFactory = await TrustFactory.new(burnerAddress);
    assert.equal(await trustFactory.mybFee(), burnFee);
    let tfAddress = await trustFactory.address;
    // console.log(tfAddress);
    await myBitBurner.authorizeBurner(tfAddress);
    let authTrue = await myBitBurner.authorizedBurner(tfAddress);
    assert.equal(true, authTrue);
  });

  it('Deploy ERC20 Trust contract', async() => {
    let trustBalance = (2 * WEI);
    let balanceStart = await erc20.balanceOf(trustor);
    // console.log('Balance at Start: ' + bn(balanceStart));

    await token.approve(burnerAddress, burnFee, {from: trustor});
    let trustExpiration = 10;
    let tx = await trustFactory.createTrustERC20(beneficiary, true, trustExpiration, erc20Address, {from: trustor});
    numTrustsMade += 1;
    let trustAddress = tx.logs[0].args._trustAddress;
    // console.log('Trust Address: ' + trustAddress);

    //Instantiate deployed trust contract
    trust = await Trust.at(trustAddress);

    // trust = await Trust.at(trustAddress);
    await erc20.approve(trustAddress, trustBalance, {from: trustor});
    await trust.depositTrust({from: trustor, value: trustBalance});

    //Confirm burnt tokens
    let userBalance = await token.balanceOf(trustor);
    // console.log(Number(userBalance));
    // console.log(tokenPerAccount - burnFee);

    let expectedTokenBalance = bn(tokenPerAccount).minus(burnFee);
    let tokenBalanceTrue = bn(expectedTokenBalance).eq(userBalance);
    assert.equal(tokenBalanceTrue, true);

    //Confirm deposit of tokens
    let balanceAfter = await erc20.balanceOf(trustor);
    // console.log('Balance After: ' + bn(balanceAfter));
    let expectedERC20Balance = bn(balanceStart).minus(trustBalance);
    assert.equal(bn(expectedERC20Balance).eq(balanceAfter), true);

    //Check trust
    assert.equal(trustor, await trust.trustor());
    assert.equal(beneficiary, await trust.beneficiary());
    assert.equal(trustBalance, await trust.trustBalance());
  });

  it('Attemp to deposit in trust', async() => {
    let err;
    try{
      await trust.depositTrust({value: WEI});
    }catch(e){
      err = e;
      // console.log('Money already deposited in trust');
    }
    assert.notEqual(err, null);
  });

  it('Attemp to deposit ERC20 in trust', async() => {
    let err;
    try{
      await trust.depositERC20Trust(WEI);
    }catch(e){
      err = e;
      // console.log('Money already deposited in trust');
    }
    assert.notEqual(err, null);
  });

  it("Expect withdraw to fail: Expiration", async() => {
    let err;
    try { await trust.withdraw({from: beneficiary}); }
    catch(e) { err = e; }
    assert.notEqual(err, null);
  });

  it('Change Expiration', async() => {
    //Change expiration to 0
    await trust.changeExpiration(0, {from: trustor});
    assert.equal(0, await trust.secUntilExpiration());
  });

  it("Expect withdraw to fail: Wrong Beneficiary", async() => {
    let err;
    try { await trust.withdraw({from: beneficiary2}); }
    catch(e) { err = e;  }
    assert.notEqual(err, null);
  });

  it('Withdraw', async() => {
    let balanceETHBefore = await web3.eth.getBalance(beneficiary);
    let balanceERC20Before = await erc20.balanceOf(beneficiary);
    let trustBalance = await trust.trustBalance();
    // console.log('Balance Before: ' + balanceERC20Before);
    // console.log('Trust Before: ' + trustBalance);
    //Advance time
    web3.currentProvider.send({
      jsonrpc: "2.0",
      method: "evm_increaseTime",
      params: [6], id: 0
    }, function(){
      console.log('Move forward in time');
    });
    //Widthdraw
    assert.equal(await trust.secUntilExpiration(), 0);
    let tx = await trust.withdraw({from: beneficiary});

    let balanceETHAfter = await web3.eth.getBalance(beneficiary);
    let gasUsed = tx.receipt.gasUsed;
    // console.log('ETH Balance After: ' + balanceETHAfter);
    // assert.equal(bn(balanceETHBefore).lt(balanceETHAfter), true);
    let balanceERC20After = await erc20.balanceOf(beneficiary);
    let expectedERC20Balance = bn(balanceERC20Before).plus(trustBalance);
    // console.log('Expected balance: ' + expectedERC20Balance);
    assert.equal(expectedERC20Balance.eq(balanceERC20After), true);
    //Check that only gas was used
    assert.equal(bn(balanceETHBefore).minus(gasUsed).eq(balanceETHAfter), true);
    trustBalance = await trust.trustBalance();
    assert.equal(trustBalance, 0);
  });

  it("Expect withdraw to fail: Trust already withdrawn", async() => {
    let err;
    try { await trust.withdraw({from: beneficiary}); }
    catch(e) { err = e; }
    assert.notEqual(err, null);
  });

  it('Fail to over depoist', async() => {
    let trustBalance = (2 * WEI);

    await token.approve(burnerAddress, burnFee, {from: trustor});
    let trustExpiration = 1000;
    let tx = await trustFactory.createTrustERC20(beneficiary, true, trustExpiration, erc20Address, {from: trustor});
    let trustAddress = tx.logs[0].args._trustAddress;

    let err;
    try{
      trust = await Trust.at(trustAddress);
      await erc20.approve(trustAddress, tokenPerAccount, {from: trustor});
      await trust.depositTrust({from: trustor, value: tokenPerAccount});
    }catch(e) { err = e; }
    assert.notEqual(err, null);
  });

  it('Deploy ERC20 Trust contract again', async() => {
    let trustBalance = (2 * WEI);

    await token.approve(burnerAddress, burnFee, {from: trustor});
    let trustExpiration = 1000;
    let tx = await trustFactory.createTrustERC20(beneficiary, true, trustExpiration, erc20Address, {from: trustor});
    let trustAddress = tx.logs[0].args._trustAddress;

    trust = await Trust.at(trustAddress);
    await erc20.approve(trustAddress, trustBalance, {from: trustor});
    await trust.depositTrust({from: trustor, value: trustBalance});
  });

  it('Fail to change beneficiary', async() => {
    let err;
    try{
      await trust.changeBeneficiary('', {from: trustor});
    }catch(e) { err = e; }
    assert.notEqual(err, null);
  });

  it('Change Beneficiary', async() => {
    //Change beneficiary to the trustor
    await trust.changeBeneficiary(beneficiary2, {from: trustor});
    const currentBeneficiary = await trust.beneficiary();
    assert.equal(beneficiary2, currentBeneficiary);
  });

  it('Try to revoke trust from different account', async() => {
    let err;
    try { await trust.revoke({from: beneficiary}); }
    catch(e) { err = e; }
    assert.notEqual(err, null);
  });

  it('Fail to pay trust contract', async() => {
    let err;
    try{await web3.eth.sendTransaction({from:trustor,to:trust.address, value:0.1*WEI});}
    catch(e) { err = e; }
    assert.notEqual(err, null);
  });

  it('Revoke Trust', async() => {
    let balanceBefore = await erc20.balanceOf(trustor);
    let trustBalance = await trust.trustBalance();

    // Revoke trust
    tx = await trust.revoke({from: trustor});
    // console.log('Trust Revoked');

    // Check variables
    let balanceAfter = await erc20.balanceOf(trustor);
    assert.equal(bn(balanceBefore).plus(trustBalance).eq(balanceAfter), true);
  });

  it('Fail to deploy ERC20 Trust - burner not approved', async() => {
    let err;
    try {
      await trustFactory.createTrustERC20(beneficiary, true, 1000, erc20Address, {from: trustor});
    }
    catch(e) { err = e; }
    assert.notEqual(err, null);
  });

  it('Fail to deploy ERC20 Trust - balance too low', async() => {
    const noBalance = web3.eth.accounts[web3.eth.accounts.length - 1];
    let trustBalance = 2 * tokenPerAccount;
    await token.approve(burnerAddress, burnFee, {from: noBalance});
    let tx = await trustFactory.createTrustERC20(beneficiary, true, 1000, erc20Address, {from: noBalance});
    let trustAddress = tx.logs[0].args._trustAddress;
    trust = await Trust.at(trustAddress);
    await erc20.approve(trustAddress, trustBalance, {from: noBalance});

    let err;
    try {
      await trust.depositTrust({from: noBalance, value: trustBalance});
    }
    catch(e) { err = e; }
    assert.notEqual(err, null);
  });

  it('Fail to revoke unrevocable trust', async() => {
    await token.approve(burnerAddress, burnFee, {from: trustor});
    let tx = await trustFactory.createTrustERC20(beneficiary, false, 1000, erc20Address, {from: trustor});
    let trustAddress = tx.logs[0].args._trustAddress;
    trust = await Trust.at(trustAddress);

    let err;
    try {
      await trust.revoke({from: trustor});
    } catch(e) { err = e; }
    assert.notEqual(err, null);
  });

  it("Close contract factory", async() => {
    await trustFactory.closeFactory();
    assert.equal(true, await trustFactory.expired());
  });

  it('Fail to deploy ERC20 Trust - factory expired', async() => {
    let err;
    try {
      await token.approve(burnerAddress, burnFee, {from: trustor});
      await trustFactory.createTrustERC20(beneficiary, true, 10, erc20Address, {from: trustor});
    }
    catch(e) { err = e; }
    assert.notEqual(err, null);
  });

});