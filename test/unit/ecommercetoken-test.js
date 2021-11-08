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

let owner;
let ecommerce;
let addr2;
let addr3;
let zeroAdress;

before( async function (){
  
    [owner, ecommerce, addr2, addr3] = await ethers.getSigners();

    zeroAdress = '0x0000000000000000000000000000000000000000'
  
  
    EcommerceToken = await ethers.getContractFactory('EcommerceToken')
    ecommerceToken = await EcommerceToken.deploy('Flexicoin', 'FLX')
  
  })

  describe('EcommerceToken', function () {
  
    it('Ecommerce is not set when deployed', async function() {
        expect( await ecommerceToken.isEcommerceSet()).to.be.false;
    })

    it('Mint is not possible while ecommerce is not set', async function(){
        const reason = "Only the ecommerce contract can mint new tokens";
        const id = '14356676767454'
        await  expect (ecommerceToken.connect(ecommerce).mint(addr3.address, id ) ).to.be.revertedWith(reason);
      });   
    
      it('Ecommerce can not be zero address', async function(){
        const reason = "The ecommerce address cannot be empty";
        await  expect (  ecommerceToken.setEcommerce(zeroAdress) ).to.be.revertedWith(reason);
      }); 

    it('Ecommerce set properly', async function() {
        await ecommerceToken.setEcommerce(ecommerce.address)
        expect( await ecommerceToken.isEcommerceSet()).to.be.true;
    })

    it('Ecommerce address set correctly', async function() {
        expect( await ecommerceToken.ecommerce()).to.equal(ecommerce.address);
    })

    it('Ecommerce can not be set twice', async function(){
        const reason = "The ecommerce address can only be set once";

        await expect ( ecommerceToken.setEcommerce(ecommerce.address) ).to.be.revertedWith(reason);
      }); 

    it('Minting is possible after ecommerce is set', async function(){
        const id = '14356676767454'
        const addr = addr3.address
        await ecommerceToken.connect(ecommerce).mint(addr3.address, id ) ;
        expect ( await ecommerceToken.ownerOf(id) ).to.equal(addr);
      });   

    it('Only owner can remmove ecommerce', async function() {
        const reason = "Ownable: caller is not the owner";
        await expect (  ecommerceToken.connect(addr2).removeEcommerce() ).to.be.revertedWith(reason);
    })

    it('Ecommerce remmoved properly', async function() {
        await ecommerceToken.removeEcommerce() 
        expect( await ecommerceToken.isEcommerceSet() ).to.be.false; 
    })

    })


   describe('When minting', function(){
    it('if is not ecommerce reject transaction', async function(){
      const reason = "Only the ecommerce contract can mint new tokens";
      const id = '143566767674356'
      await expect ( ecommerceToken.connect(addr3).mint(addr3.address, id ) ).to.be.revertedWith(reason);
    });   

    

  });