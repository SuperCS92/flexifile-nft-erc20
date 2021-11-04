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
  let addr3;
  let addr4;
  let addr5;
  const addresses = []
  
before( async function (){
  
  [owner, addr1, addr2, addr3, addr4, addr5] = await ethers.getSigners();
  addresses.push(addr2.address) 
  addresses.push(addr3.address)
  addresses.push(addr4.address)
  addresses.push(addr5.address)

  KycContract = await ethers.getContractFactory('KycContract')
  kycContract = await KycContract.deploy()
  
  await kycContract.deployed() 
  //await flexicoinContract.setMinterRole(addr1.address)
  

})

describe('Kyc', function () {
  
    it('Should validate one address correctly', async function() {
        await kycContract.setSingleKyc(addr1.address);
        expect( await kycContract.kycCompleted(addr1.address)).to.be.true;
    })

    it('Should validate multiple addresses correctly', async function() {
        await kycContract.setMultipleKyc(addresses);
        expect( await kycContract.kycCompleted(addr4.address)).to.be.true;
    })

    it('Should revoke one address correctly', async function() {
        await kycContract.revokeSingleKyc(addr1.address);
        expect( await kycContract.kycCompleted(addr1.address)).to.be.false;
    })

    it('Should revoke multiple addresses correctly', async function() {
        await kycContract.revokeMultipleKyc(addresses);
        expect( await kycContract.kycCompleted(addr4.address)).to.be.false;
    })

});