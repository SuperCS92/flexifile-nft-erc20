 
require("@nomiclabs/hardhat-ethers");
require('dotenv').config()
require("@nomiclabs/hardhat-waffle");


/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 module.exports = {
  defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            // // If you want to do some forking, uncomment this
            // forking: {
            //   url: MAINNET_RPC_URL
            // }
        },
        localhost: {
        },
        kovan: {
            url: process.env.KOVAN_RPC_URL,
            accounts: [process.env.PRIVATE_KEY],
            saveDeployments: true,
        },
        testnet: {
          url: "https://data-seed-prebsc-1-s1.binance.org:8545",
          chainId: 97,
          gasPrice: 20000000000,
          accounts: [process.env.PRIVATE_KEY]
        },
        mainnet: {
          url: "https://bsc-dataseed.binance.org/",
          chainId: 56,
          gasPrice: 20000000000,
          accounts: [process.env.PRIVATE_KEY]
        }
    },
  solidity: "0.8.9",
};
