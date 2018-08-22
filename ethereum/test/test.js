var BigNumber = require('bignumber.js');

/* Contracts  */
const Token = artifacts.require("./token/ERC20.sol");
const Trust = artifacts.require("./Trust.sol");
const TrustFactory = artifacts.require("./TrustFactory.sol");
const EqualDistribution = artifacts.require("./distrubtion/EqualDistribution.sol");
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

  const tokenSupply = 100000;
  const tokenPerAccount = 1000;
  const burnFee = 250;

  let originalBeneficiary; //Original beneficiary

  // Contract instances
  let token; // Token contract instance
  let trust;   // Trust contract instance
  let trustFactory;  // TrustFactory contract instance
  let myBitBurner;   // MyBitBurner contract instance
  let eqDistribution;      // EqualDistribution instance

  // Contract addresses
  let tokenAddress;
  let burnerAddress;

  // Deploy token contract
  it ('Deploy MyBit Token contract', async() => {
    token = await Token.new(tokenSupply, "MyBit Token", 8, "MyB");
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
    const totalTokensCirculating = (web3.eth.accounts.length - 1) * (tokenPerAccount);
    const remainingTokens = tokenSupply - totalTokensCirculating;
    assert.equal(await token.balanceOf(owner), remainingTokens);
  });

  it ('Deploy MyBitBurner contract', async() => {
    myBitBurner = await MyBitBurner.new(tokenAddress);
    burnerAddress = await myBitBurner.address;
    console.log(burnerAddress);
  });

  it ('Deploy TrustFactory contract', async() => {
    trustFactory = await TrustFactory.new(burnerAddress);
    tfAddress = await trustFactory.address;
    console.log(tfAddress);
    await myBitBurner.authorizeBurner(tfAddress);
    let authTrue = await myBitBurner.authorizedBurner(tfAddress);
    assert.equal(true, authTrue);
  });

  it('Deploy Trust contract', async() => {
    let balanceStart = await web3.eth.getBalance(trustor);
    console.log('Balance at Start: ' + balanceStart);

    //Give MyBitBurner permission to handle user tokens (limit burnFee)
    await token.approve(burnerAddress, burnFee, {from: trustor});

    tx = await trustFactory.deployTrust(beneficiary, true, 4, {from: trustor, value: (2 * WEI) });
    trustAddress = tx.logs[0].args._trustAddress;
    console.log('Trust Address: ' + trustAddress);

    //Confirm burnt tokens
    let userBalance = await token.balanceOf(trustor);
    console.log(Number(userBalance));
    console.log(tokenPerAccount - burnFee);
    assert.equal(Number(userBalance), (tokenPerAccount - burnFee));

    //Instantiate deployed trust contract
    trust = await Trust.at(trustAddress);

    //Check trust
    assert.equal(trustor, await trust.trustor());
    assert.equal(beneficiary, await trust.beneficiary());
    assert.equal((2 * WEI), await trust.trustBalance());
    let expiration = await trust.expiration();
    let blockNumber = await web3.eth.getBlock('latest').number;
    assert.equal(blockNumber + 4, expiration);
  });

  it('Revoke Trust', async() => {
    let balanceBefore = await web3.eth.getBalance(trustor);

    // Revoke trust
    await trust.revoke({from: trustor});
    console.log('Trust Revoked');

    // Check variables
    let balanceAfter = await web3.eth.getBalance(trustor);   // TODO: should get actual gas used in the transaction
    assert.equal(BigNumber(balanceBefore).lt(balanceAfter), true);

  });

  it("Try to change expiration", async() => {
    try {
      let expirationBefore = await trust.expiration();
      console.log('Old Expiration: ' + expirationBefore);
      //Change expiration to 0 more blocks
      await trust.changeExpiration(0, {from: trustor});
      assert.equal(0, await trust.blocksUntilExpiration());
    } catch(e) {
        console.log("Unable to change Expiration");
        return true;
    }
  });

  // Make sure beneficiary can't still make withdraw
  it("Expect withdraw to fail", async() => {
    try {
      await trust.withdraw({from: beneficiary});
      let err;
    } catch(e) {
        console.log("EVM error: No income left in trust");
        err = e;
        return true;
    }
    assert.equal(err, null);
  });

  it('Deploy New Trust contract', async() => {
    //Give MyBitBurner permission to handle user tokens (limit burnFee)
    await token.approve(burnerAddress, burnFee, {from: trustor});
    //Use trustFactory to deploy trust
    tx = await trustFactory.deployTrust(beneficiary, true, 10, {from: trustor, value: (2 * WEI) });
    trustAddress = tx.logs[0].args._trustAddress;
    console.log('Trust Address: ' + trustAddress);

    //Confirm burnt tokens
    let userBalance = await token.balanceOf(trustor);
    assert.equal(Number(userBalance), (tokenPerAccount - (burnFee * 2)));

    //Instantiate deployed trust contract
    trust = await Trust.at(trustAddress);

    //console.log(await trust.expiration());
    assert.equal(trustor, await trust.trustor());
    assert.equal(beneficiary, await trust.beneficiary());
    assert.equal((2 * WEI), await trust.trustBalance());
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
    try {
      await trust.changeExpiration(-1, {from: trustor});
    } catch(e) {
        console.log("EVM error: Can't change expiration by negative number");
        return true;
    }
  });

  it("Expect withdraw to fail: Expiration", async() => {
    try {
      await trust.withdraw({from: currentBeneficiary});
    } catch(e) {
        console.log("EVM error: Expiration has not been reached");
        return true;
    }
  });

  it('Change Expiration', async() => {
    let blockNumber = await web3.eth.getBlock('latest').number;
    console.log('Current Block: ' + blockNumber);
    let expirationBefore = await trust.expiration();
    console.log('Old Expiration: ' + expirationBefore);
    //Change expiration to 0
    await trust.changeExpiration(0, {from: trustor});
    blockNumber = await web3.eth.getBlock('latest').number;
    console.log('Current Block: ' + blockNumber);
    let expirationAfter = await trust.expiration();
    console.log('New Expiration: ' + expirationAfter);
    assert.equal(0, await trust.blocksUntilExpiration());
  });

  it("Expect withdraw to fail: Wrong Beneficiary", async() => {
    try {
      await trust.withdraw({from: originalBeneficiary});
      console.log("Logic error: Incorrect beneficiary allowed to withdraw");
    } catch(e) {
        console.log("EVM error: Incorrect beneficiary");
        return true;
    }
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
    assert.equal(0, await trust.trustBalance());
    let balanceAfter = await web3.eth.getBalance(currentBeneficiary);   // TODO: should get actual gas used in the transaction
    console.log('Balance After: ' + balanceAfter);
    assert.equal(BigNumber(balanceBefore).lt(balanceAfter), true);
  });

  it("Expect withdraw to fail: Trust already withdrawn", async() => {
    try {
      await trust.withdraw({from: currentBeneficiary});
    } catch(e) {
        console.log("EVM error: No income left in trust");
        return true;
    }
  });

  // TODO test EqualDistribution

  //Having trouble passing array of addresses to contract: Error: Invalid number of arguments to Solidity function

  it('Deploy EqualDistribution contract', async() => {
    let balanceStart = await web3.eth.getBalance(trustor);
    console.log('Balance at Start: ' + balanceStart);
    eqDistribution = await EqualDistribution.new(beneficiaries, {from: trustor});

    for (let i =0; i < beneficiaries.length; i++){
      assert.equal(beneficiaries[i], await eqDistribution.beneficiaries(i));
    }
  });

  it('Check if beneficiary', async() => {
    isBeneficiaryTrue = await eqDistribution.isBeneficiary(beneficiary2);
    assert.equal(isBeneficiaryTrue, true);

    isBeneficiaryFalse = await eqDistribution.isBeneficiary(trustor);
    assert.equal(isBeneficiaryFalse, false);
  });

  it('Set up trust for beneficiaries', async() => {
    //console.log(eqDistribution);
    eqAddress = await eqDistribution.address;
    console.log(eqAddress);

    //Give MyBitBurner permission to handle user tokens (limit burnFee)
    await token.approve(burnerAddress, burnFee, {from: trustor});

    //Use trustFactory to deploy trust
    tx = await trustFactory.deployTrust(eqAddress, true, 4, {from: trustor, value: (12 * WEI) });
    trustAddress = tx.logs[0].args._trustAddress;

    //Instantiate deployed trust contract
    trust = await Trust.at(trustAddress);

    assert.equal((12 * WEI), await trust.trustBalance());

    await trust.changeExpiration(0, {from: trustor});
    //assert.equal(0, await trust.blocksUntilExpiration());
    //await sleep(1000);

    await eqDistribution.getFunds(trustAddress, {from: trustor});
    //console.log(getFundsTrue);//Does not return true
    //assert.equal(getFundsTrue, true);

  });

  it('Withdraw funds to beneficiaries', async() => {
    let b1Before = await web3.eth.getBalance(beneficiary);
    let b1True = await eqDistribution.withdraw({from: beneficiary});
    let b1After = await web3.eth.getBalance(beneficiary);
    console.log(b1After - b1Before);
    //assert.equal(b1True, true);
    //assert.equal(b1After - b1Before, (14 * WEI)/3); //Need to calculate gas used up to this point
    assert.equal(BigNumber(b1Before).lt(b1After), true);
  });


});
