const { expect, use } = require("chai");
const { ethers } = require("hardhat");

const solidity =  require('ethereum-waffle') 
const chai = require('chai')
const BN = require('bn.js')
//const skipIf = require('mocha-skip-if')
chai.use(require('chai-bn')(BN))
const { deployments, getChainId } = require('hardhat')
const web3 = require('web3');
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

//use(solidity);

describe("FlexiCoin", function () {

  let owner;
  let addr1;
  let minterRole;
  let value;


  before( async function (){

    [owner, addr1, addr2, lock1, lock2, lock3, lock4] = await ethers.getSigners();
    amount = '1000000000000000000000'; //1000 tokens
    amount_over_limit = '90000000000000000000000001';//
    amount_lock ='16000000000000000000000000';

    FlexiCoinContract = await ethers.getContractFactory('FlexiCoin')
    flexicoinContract = await  FlexiCoinContract.deploy()
    
    await flexicoinContract.deployed() 

    await flexicoinContract.setMinterRole(addr1.address)

    await flexicoinContract.lock(lock1.address, lock2.address, lock3.address, lock4.address)

    minterRole = await flexicoinContract.MINTER_ROLE()

  })

 it('Total supply is 16.000.000', async function() {
    expect((await flexicoinContract.totalSupply()).toString()).to.equal('80000000000000000000000000')
 })

 it('Minter role set correctly', async function(){
   expect ( await flexicoinContract.hasRole(minterRole, addr1.address)).to.be.true
 })

 it('Minter should be able to mint', async function(){
    await flexicoinContract.connect(addr1).mint(addr2.address, amount);
    expect(await flexicoinContract.balanceOf(addr2.address)).to.equal(amount);
 })

 it('Amount sell variable updated', async function (){
  expect( await flexicoinContract.getAmount_sell()).to.equal(amount);
 })

 it('Buy more than ICO limit should revert', async function(){
  await expect(flexicoinContract.connect(addr1).mint(addr2.address, amount_over_limit)
   ).to.be.revertedWith('ICO sell limit has been reached');
 })

 it('Sending to lock1 successfully', async function(){
  expect(await flexicoinContract.balanceOf(lock1.address)).to.equal(amount_lock);
 })

 it('Sending to lock2 successfully', async function(){
  expect(await flexicoinContract.balanceOf(lock2.address)).to.equal(amount_lock);
 })

 it('Sending to lock3 successfully', async function(){
  expect(await flexicoinContract.balanceOf(lock3.address)).to.equal(amount_lock);
 })

 it('Sending to lock4 successfully', async function(){
  expect(await flexicoinContract.balanceOf(lock4.address)).to.equal(amount_lock);
 })
  
});