// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "hardhat/console.sol";
import "./TapWaterCoin.sol";

contract BorrowYourCar is ERC721 {

    // use a event if you want
    // to represent time you can choose block.timestamp
    event CarBorrowed(uint256 carTokenId, address borrower, uint256 startTime, uint256 duration);

    // maybe you need a struct to store car information
    struct Car {
        address owner;
        address borrower;
        uint256 borrowUntil;
    }

    mapping(uint256 => Car) public cars; // A map from car index to its information
    mapping(address => uint256[]) private ownedCars; // 用户拥有的车辆列表
    uint256 count = 0; // 发行的车辆总数
    TapWaterCoin public tapWaterCoin;

    constructor() ERC721("BorrowYourCar", "BYC") {
        tapWaterCoin = new TapWaterCoin("TapWaterCoin", "TWC");
    }

    function mintCar() external {
        uint256 newCarTokenId = count + 1;
        _safeMint(msg.sender, newCarTokenId);
        cars[newCarTokenId] = Car(msg.sender, address(0), 0);
        ownedCars[msg.sender].push(newCarTokenId);
        count++;
    }

    function borrowCar(uint256 carTokenId, uint256 duration) external { // 传入车辆ID，借用时长
        require(ownerOf(carTokenId) != msg.sender, "You cannot borrow your own car"); // 自己的车
        require(cars[carTokenId].borrower == address(0), "Car is already borrowed"); // 已被借用

        uint256 rentalFee = duration / 60; // 一分钟1个自来水币
        require(tapWaterCoin.balanceOf(msg.sender) >= rentalFee, "Insufficient balance"); // 余额不足
        tapWaterCoin.transferFrom( msg.sender,cars[carTokenId].owner, rentalFee); // 交易

        cars[carTokenId].borrower = msg.sender; // 写入借用者
        cars[carTokenId].borrowUntil = block.timestamp + duration; // 借用到期时间
        emit CarBorrowed(carTokenId, msg.sender, block.timestamp, duration); // 向区块链发送交易事件
    }

    function getOwnedCars() external view returns (uint256[] memory) {
        return ownedCars[msg.sender];
    }

    function getAvailableCars() external view returns (uint256[] memory) {
        uint256 totalCars = count;
        uint256 availableCount = 0;
        for (uint256 i = 1; i <= totalCars; i++) {
            if (cars[i].borrower == address(0)) {
                availableCount++;
            }
        }
        uint256[] memory availableCars = new uint256[](availableCount);
        uint256 index = 0;
        for (uint256 i = 1; i <= totalCars; i++) {
            if (cars[i].borrower == address(0)) {
                availableCars[index] = i;
                index++;
            }
        }
        return availableCars;
    }

    function getOwner(uint256 carId) external view returns(address){
        Car storage car = cars[carId];
        return car.owner;
    }

    function getBorrower(uint256 carId) external view returns(address){
        Car storage car = cars[carId];
        if( uint256(car.borrowUntil) >= block.timestamp){
            return car.borrower;
        }
        else{
            return address(0);
        }
    }

    function update() external {
        uint256 totalCars = count;
        for (uint256 i = 1; i <= totalCars; i++) {
            if (uint256(cars[i].borrowUntil) < block.timestamp) {
                cars[i].borrower = address(0);
            }
        }
    }
}