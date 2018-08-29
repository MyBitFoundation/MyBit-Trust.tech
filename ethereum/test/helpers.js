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

// Advances the block number so that the last mined block is `number`.
async function advanceToBlock (number) {
  if (web3.eth.blockNumber > number) {
    throw Error(`block number ${number} is in the past (current is ${web3.eth.blockNumber})`);
  }

  while (web3.eth.blockNumber < number) {
    await advanceBlock();
  }
}

module.exports = {
  advanceBlock,
  advanceToBlock,
};

async function assertRevert (promise) {
  try {
    await promise;
  } catch (error) {
    const revertFound = error.message.search('revert') >= 0;
    assert(revertFound, `Expected "revert", got ${error} instead`);
    return;
  }
  assert.fail('Expected revert not received');
}

module.exports = {
  assertRevert,
};


async function assertJump (promise) {
  try {
    await promise;
    assert.fail('Expected invalid opcode not received');
  } catch (error) {
    const invalidOpcodeReceived = error.message.search('invalid opcode') >= 0;
    assert(invalidOpcodeReceived, `Expected "invalid opcode", got ${error} instead`);
  }
}

module.exports = {
  assertJump,
};


async function expectThrow (promise, message) {
  try {
    await promise;
  } catch (error) {
    // Message is an optional parameter here
    if (message) {
      assert(
        error.message.search(message) >= 0,
        'Expected \'' + message + '\', got \'' + error + '\' instead',
      );
      return;
    } else {
      // TODO: Check jump destination to destinguish between a throw
      //       and an actual invalid jump.
      const invalidOpcode = error.message.search('invalid opcode') >= 0;
      // TODO: When we contract A calls contract B, and B throws, instead
      //       of an 'invalid jump', we get an 'out of gas' error. How do
      //       we distinguish this from an actual out of gas event? (The
      //       ganache log actually show an 'invalid jump' event.)
      const outOfGas = error.message.search('out of gas') >= 0;
      const revert = error.message.search('revert') >= 0;
      assert(
        invalidOpcode || outOfGas || revert,
        'Expected throw, got \'' + error + '\' instead',
      );
      return;
    }
  }
  assert.fail('Expected throw not received');
}

module.exports = {
  expectThrow,
};
