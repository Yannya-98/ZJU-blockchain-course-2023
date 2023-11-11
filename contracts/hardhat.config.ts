import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      // rpc url, change it according to your ganache configuration
      url: 'http://127.0.0.1:8545',
      // the private key of signers, change it according to your ganache user
      accounts: [
        '0xa0a9f759848dbff6da1892396a4c5b494ab65611fd908d949b95ad7ac1a2d25d',
        '0xed1b4066cf3accd637722d9c8d63695312ba367715690879b51ad310578f4f6a'
      ]
    },
  },
};

export default config;
