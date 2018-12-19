var bn = require('bignumber.js');

/* Contracts  */
const Token = artifacts.require("./token/ERC20.sol");
const ERC721 = artifacts.require("./token/SampleERC721.sol");
const Trust = artifacts.require("./TrustERC721.sol");
const TrustFactory = artifacts.require("./TrustFactory.sol");
const MyBitBurner = artifacts.require("./MyBitBurner.sol");

const WEI = 1000000000000000000;

contract('Trust - Using ERC721', async (accounts) => {
  const owner = web3.eth.accounts[0];
  const trustor = web3.eth.accounts[1];
  const beneficiary = web3.eth.accounts[2];
  const beneficiary2 = web3.eth.accounts[3];

  const tokenSupply = 180000000000000000000000000;
  const tokenPerAccount = 1000000000000000000000;

  let burnFee = 250000000000000000000;

  // Contract instances
  let token; // Token contract instance
  let erc721; // ERC721 contract instance
  let trust;   // Trust contract instance
  let trustFactory;  // TrustFactory contract instance
  let myBitBurner;   // MyBitBurner contract instance


  // Contract addresses
  let tokenAddress;
  let erc721Address;
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
  it ('Deploy ERC721 Token contract', async() => {
    erc721 = await ERC721.new();
    erc721Address = await erc721.address;
    // console.log(erc721Address);

    // assert.equal(await erc20.totalSupply(), tokenSupply);
    // assert.equal(await erc20.balanceOf(owner), tokenSupply);
  });

  // Give every user tokenPerAccount amount of tokens
  it("Mint some tokens", async () => {
    for (var i = 1; i < 5; i++) {
      let tokenId = i * 100;
      await erc721.mint(trustor, tokenId);
      let ownerOfToken = await erc721.ownerOf(tokenId);
      assert.equal(ownerOfToken, trustor);
    }
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

  it('Deploy ERC721 Trust contract', async() => {
    let tokenId = 100;

    let ownerOfToken = await erc721.ownerOf(tokenId);
    assert.equal(ownerOfToken, trustor);

    await token.approve(burnerAddress, burnFee, {from: trustor});
    let trustExpiration = 1000;
    let tx = await trustFactory.createTrustERC721(beneficiary, true, trustExpiration, erc721Address, {from: trustor});
    let trustAddress = tx.logs[0].args._trustAddress;
    // console.log('Trust Address: ' + trustAddress);

    //Instantiate deployed trust contract
    trust = await Trust.at(trustAddress);

    // trust = await Trust.at(trustAddress);
    await erc721.approve(trustAddress, tokenId, {from: trustor});
    await trust.depositTrust(tokenId, {from: trustor});

    //Confirm burnt tokens
    let userBalance = await token.balanceOf(trustor);

    let expectedTokenBalance = bn(tokenPerAccount).minus(burnFee);
    let tokenBalanceTrue = bn(expectedTokenBalance).eq(userBalance);
    assert.equal(tokenBalanceTrue, true);

    //Confirm deposit of tokens
    ownerOfToken = await erc721.ownerOf(tokenId);
    assert.notEqual(ownerOfToken, trustor);
    assert.equal(ownerOfToken, trustAddress);

    //Check trust
    assert.equal(trustor, await trust.trustor());
    assert.equal(beneficiary, await trust.beneficiary());
    assert.equal(tokenId, await trust.trustTokenId());
  });



  it('Attemp to deposit in trust', async() => {
    let err;
    try{
      await trust.depositTrust(200);
    }catch(e){
      err = e;
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
    let tokenId = await trust.trustTokenId();
    let ownerOfToken = await erc721.ownerOf(tokenId);
    assert.equal(ownerOfToken, trust.address);

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
    ownerOfToken = await erc721.ownerOf(tokenId);
    assert.equal(ownerOfToken, beneficiary);
    //Check that only gas was used
    assert.equal(bn(balanceETHBefore).minus(gasUsed).eq(balanceETHAfter), true);
    assert.notEqual(await trust.trustTokenId(), tokenId);
  });

  it("Expect withdraw to fail: Trust already withdrawn", async() => {
    let err;
    try { await trust.withdraw({from: beneficiary}); }
    catch(e) { err = e; }
    assert.notEqual(err, null);
  });

  it('Deploy ERC721 Trust contract again', async() => {
    let tokenId = 300;

    await token.approve(burnerAddress, burnFee, {from: trustor});
    let trustExpiration = 1000;
    let tx = await trustFactory.createTrustERC721(beneficiary, true, trustExpiration, erc721Address, {from: trustor});
    let trustAddress = tx.logs[0].args._trustAddress;

    trust = await Trust.at(trustAddress);
    await erc721.approve(trustAddress, tokenId, {from: trustor});
    await trust.depositTrust(tokenId, {from: trustor});
  });

  it('Fail to change beneficiary', async() => {
    let err;
    try{
      await trust.changeBeneficiary('', {from: trustor});
    }catch(e) { err = e; }
    assert.notEqual(err, null);
  });

  it('Change Beneficiary', async() => {
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
    var tokenId = await trust.trustTokenId();
    let ownerOfToken = await erc721.ownerOf(tokenId);
    assert.equal(ownerOfToken, trust.address);

    // Revoke trust
    tx = await trust.revoke({from: trustor});

    // Check variables
    ownerOfToken = await erc721.ownerOf(tokenId);
    assert.notEqual(ownerOfToken, trust.address);
    assert.equal(ownerOfToken, trustor);
  });

  it('Fail to deploy ERC721 Trust - burner not approved', async() => {
    let err;
    try {
      await trustFactory.createTrustERC721(beneficiary, true, 1000, erc721Address, {from: trustor});
    }
    catch(e) { err = e; }
    assert.notEqual(err, null);
  });

  it('Fail to deploy ERC721 Trust - not owner', async() => {
    await token.approve(burnerAddress, burnFee, {from: trustor});
    let tx = await trustFactory.createTrustERC721(beneficiary, true, 1000, erc721Address, {from: trustor});
    let trustAddress = tx.logs[0].args._trustAddress;
    trust = await Trust.at(trustAddress);

    let err;
    try {
      await trust.depositTrust(10, {from: trustor});
    }
    catch(e) { err = e; }
    assert.notEqual(err, null);
  });

  it('Fail to revoke unrevocable trust', async() => {
    await token.approve(burnerAddress, burnFee, {from: trustor});
    let tx = await trustFactory.createTrustERC721(beneficiary, false, 1000, erc721Address, {from: trustor});
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

  it('Fail to deploy ERC721 Trust - factory expired', async() => {
    let err;
    try {
      await token.approve(burnerAddress, burnFee, {from: trustor});
      await trustFactory.createTrustERC721(beneficiary, true, 10, erc721Address, {from: trustor});
    }
    catch(e) { err = e; }
    assert.notEqual(err, null);
  });

  it("SampleERC721 coverage", async() => {
    //SampleERC721 is used only for tests. Ensure it does not fail coverage tests
    erc721 = await ERC721.new();
    assert.equal(await erc721.balanceOf(beneficiary), 0);
    erc721.mint(trustor, 1000);

    await erc721.approve(beneficiary, 1000, {from: trustor});
    assert.equal(await erc721.getApproved(1000), beneficiary);

    await erc721.setApprovalForAll(beneficiary2, true, {from: trustor});
    assert.equal(await erc721.isApprovedForAll(trustor, beneficiary2), true);

    await erc721.transferFrom(trustor, beneficiary, 1000, {from: trustor});

    // erc721.mint(trustor, 2000);
    // await erc721.approve(beneficiary, 2000, {from: trustor});
    // await erc721.safeTransferFrom(trustor, beneficiary, 2000, {from: trustor});
    // //
    // erc721.mint(trustor, 3000);
    // await erc721.approve(beneficiary, 3000, {from: trustor});
    // await erc721.safeTransferFrom(trustor, beneficiary, 3000, "0x4920686176652031303021", {from: trustor});
  });
});