import Addresses from './contract-addresses.json'
import BorrowYourCar from './abis/BorrowYourCar.json'
import TapWaterCoin from './abis/TapWaterCoin.json'

const Web3 = require('web3');

// @ts-ignore
// 创建web3实例
// 可以阅读获取更多信息https://docs.metamask.io/guide/provider-migration.html#replacing-window-web3
let web3 = new Web3(window.web3.currentProvider)

// 修改地址为部署的合约地址
const borrowYourCarAddress = Addresses.borrowYourCar
const borrowYourCarABI = BorrowYourCar.abi
const tapAddress = Addresses.tapWaterCoin
const tapABI = TapWaterCoin.abi

// 获取合约实例
const borrowYourCarContract = new web3.eth.Contract(borrowYourCarABI, borrowYourCarAddress);
const tapContract = new web3.eth.Contract(tapABI, tapAddress);

// 导出web3实例和其它部署的合约
export {web3, borrowYourCarContract, tapContract}