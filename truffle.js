module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*",
      gasPrice: 1
    },
    coverage: {
      host: "localhost",
      port: 8555,
      network_id: "*",
      gas: 0xfffffffffff,
      gasPrice: 0x01
    }
  },
  solc: {
    optimizer: {
        enabled: true,
        runs:    200
    }
  },
  compilers: {
    solc: {
        version: "0.4.24"
    }
  }
};
