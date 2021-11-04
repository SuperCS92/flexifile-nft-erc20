
const { expect, use } = require("chai");
//const { ethers } = require("hardhat");

const solidity =  require('ethereum-waffle') 
const chai = require('chai')
const BN = require('bn.js')
//const skipIf = require('mocha-skip-if')
chai.use(require('chai-bn')(BN))
const { deployments, getChainId } = require('hardhat')
const web3 = require('web3');
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

  let owner;
  let addr1;
  let addr2;
  const _rate = 500; 

before( async function (){
  
  [owner, addr1, addr2, addr3] = await ethers.getSigners();

  //First kyc contract
  //Then the Sale Contract
  KycContract = await ethers.getContractFactory('KycContract')
  kycContract = await KycContract.deploy()

  await kycContract.setSingleKyc(addr2.address);

  //Then the Sale Contract
  FlexiCoinSaleContract = await ethers.getContractFactory('FlexiCoinSale')
  flexicoinSaleContract = await  FlexiCoinSaleContract.deploy(_rate, owner.address, addr1.address, kycContract.address)
  
  await flexicoinSaleContract.deployed() 

})

  describe('FlexiCoinSale', function () {
  
   it('Rate is set correctly', async function() {
      expect((await flexicoinSaleContract.rate()).toString()).to.equal(_rate.toString());
   })

   it('Wallet is set correctly', async function() {
    expect((await flexicoinSaleContract.wallet())).to.equal(owner.address); 
    })

    it('Token is set correctly', async function() {
        expect((await flexicoinSaleContract.token())).to.equal(addr1.address); 
    })
  
  });

    describe('buyTokens()', function () {

    let investorMinCap = '2000000000000000'; //ether(0.002);
    let investorMaxCap = '50000000000000000000';//ether(50);

    describe('When the contribution is less than minimum cap', function(){
      it('rejects the transaction', async function(){
        const value = investorMinCap - 1;
        const reason = "Investor cap out of boundaries";
        await expect ( flexicoinSaleContract.connect(addr2).buyTokens(addr2.address, {value: value}) ).to.be.revertedWith(reason);
      });
    });

    describe('When the contribution is more than maximum cap', function(){
      it('rejects the transaction', async function(){
        const value = investorMaxCap + 1;
        const reason = "Investor cap out of boundaries";
        await expect ( flexicoinSaleContract.connect(addr2).buyTokens(addr2.address, {value: value}) ).to.be.revertedWith(reason);
      });
    });

    describe('When the investor is not whitelisted', function(){
      it('rejects the transaction', async function(){
        const value = investorMinCap;
        const reason = "Operator not white listed";
        await expect ( flexicoinSaleContract.connect(addr3).buyTokens(addr3.address, {value: value}) ).to.be.revertedWith(reason);
      });   
    });

  });