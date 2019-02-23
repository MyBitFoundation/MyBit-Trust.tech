module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*",
      gasPrice: 1
    },
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
