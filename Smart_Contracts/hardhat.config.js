require('@nomiclabs/hardhat-waffle');
require('dotenv').config();
require("@nomiclabs/hardhat-etherscan");
module.exports = {
  solidity: '0.8.1',
  networks: {
    rinkeby: {
      url: process.env.STAGING_ALCHEMY_KEY,
      accounts: [process.env.PRIVATE_KEY],
    },
    mainnet: {
      chainId: 1,
      url: process.env.PROD_ALCHEMY_KEY,
      accounts: [process.env.PRIVATE_KEY],
    },
    
  },
  etherscan:{
    apikey:'D3R2MQ7TAWQYU9ZMWVEQ6EM5QGRW3V83CT'
  }
};