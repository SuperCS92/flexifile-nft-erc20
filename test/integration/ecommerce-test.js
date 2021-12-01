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
const { Description } = require("@ethersproject/properties");

let owner;
let ecommerce;
let addr1;
let addr2;

before( async function (){
  
    [owner, addr1, addr2] = await ethers.getSigners(); 
    zeroAdress = '0x0000000000000000000000000000000000000000' 

    //First we need to deploy the NFT contract and ERC20 contract
    EcommerceToken = await ethers.getContractFactory('EcommerceToken')
    ecommerceToken = await EcommerceToken.deploy('Flexicoin', 'FLX')

    await ecommerceToken.deployed()

    //console.log(' NFT token deployed with contract address: ', ecommerceToken.address)

    FlexiCoinContract = await ethers.getContractFactory('FlexiCoin')
    flexicoinContract = await  FlexiCoinContract.deploy()
    
    await flexicoinContract.deployed() 
    await flexicoinContract.unpause()

    //console.log(' ERC20 token deployed with contract address: ', flexicoinContract.address)

    Ecommerce = await ethers.getContractFactory('Ecommerce')
    ecommerce = await Ecommerce.deploy(ecommerceToken.address, flexicoinContract.address, '1000000000000000000' )
  
    await ecommerce.deployed() 

    const setEcommerceTx = await ecommerceToken.setEcommerce(ecommerce.address);

    // wait until the transaction is mined
    await setEcommerceTx.wait();

    //console.log(' Ecommerce initialized with NFT: ', await ecommerce.ERC721TOKEN())
    //console.log(' Ecommerce initialized with ERC20: ', await ecommerce.ERC20TOKEN())


  })

  describe( 'Ecommerce initialization ', function(){

    it('NFT tokens set correctly', async function(){
        expect( await ecommerce.ERC721TOKEN() ).to.equal(ecommerceToken.address)
    })

    it('ERC20 tokens set correctly', async function(){
        expect( await ecommerce.ERC20TOKEN() ).to.equal(flexicoinContract.address)
    })

  })

  describe( 'Publish product ', function(){

    it('Owner should be able to publish a product', async function() {
      let id = '1'
      let to = addr1.address
      let title = 'Test NFT'
      let description = 'This is the first NFT'

      await ecommerce.publishProduct(id, to, title, description)

      expect( await ecommerceToken.ownerOf( id)).to.equal(addr1.address )
    })

    it('Should reject if its not the owner AND have insufficient balance of the ERC20', async function() {
      let id = '2'
      let to = addr1.address
      let title = 'Test NFT'
      let description = 'This is the first NFT'
      let reason = 'Insufficient balance to mint an NFT'

      await expect( ecommerce.connect(addr1).publishProduct(id, to, title, description) ).to.be.revertedWith(reason); 
    })

    it('Should reject if id is equal to 0', async function() {
      let id = '0'
      let to = addr1.address
      let title = 'Test NFT'
      let description = 'This is the first NFT'
      let reason = 'The id cannot be empty'

      await expect( ecommerce.publishProduct(id, to, title, description) ).to.be.revertedWith(reason); 
    })

    it('Should reject if title is empty', async function() {
      let id = '5'
      let to = addr1.address
      let title = ''
      let description = 'This is the first NFT'
      let reason = 'The title cannot be empty'

      await expect( ecommerce.publishProduct(id, to, title, description) ).to.be.revertedWith(reason); 
    })

    it('Should reject if description is empty', async function() {
      let id = '5'
      let to = addr1.address
      let title = 'This is the fifth NFT'
      let description = ''
      let reason = 'The description cannot be empty'

      await expect( ecommerce.publishProduct(id, to, title, description) ).to.be.revertedWith(reason); 
    })

    it('Should publish a product after burning NFTMINTPRICE amount of ERC20 tokens', async function(){
      //First we need to fund the wallet with the erc20 enough for mint
      await flexicoinContract.transfer(addr1.address, '1000000000000000000')

      let id = '6'
      let to = addr1.address
      let title = 'This is the fifth NFT'
      let description = 'This is the first NFT'

      await ecommerce.connect(addr1).publishProduct(id, to, title, description)
      expect( await ecommerceToken.ownerOf( id)).to.equal(addr1.address )

    })

    it('Should burn NFTMINTPRICE amount of tokens successfully after minting', async function(){
      //First we need to fund the wallet with the erc20 enough for mint
      await flexicoinContract.transfer(addr1.address, '2000000000000000000')

      let balance = await flexicoinContract.balanceOf(addr1.address)

      let id = '7'
      let to = addr1.address
      let title = 'This is the fifth NFT'
      let description = 'This is the first NFT'

      await expect(ecommerce.connect(addr1).publishProduct(id, to, title, description))
          .to.emit(flexicoinContract, 'Transfer')
          .withArgs(addr1.address, zeroAdress, '1000000000000000000');

    })


    it('Should approve NFT to ecommerce when minted', async function(){
      //First we need to fund the wallet with the erc20 enough for mint
      await flexicoinContract.transfer(addr1.address, '1000000000000000000')

      let id = '8'
      let to = addr1.address
      let title = 'This is the fifth NFT'
      let description = 'This is the first NFT'

      await expect( ecommerce.connect(addr1).publishProduct(id, to, title, description) )
          .to.emit(ecommerceToken, 'Approval')
          .withArgs(addr1.address, ecommerce.address, id);

    })

      
  })

  describe('Testing isForSale state of a product', function(){

    it('The isForSale state of a product must be false ', async function(){
      let id = '8'
      let product = await ecommerce.productById(id)

      expect (product['isForSale']).to.be.false
    })

    it('Should revert if trying to buy a product that is not for sale', async function(){
      let id = '8'
      let reason = 'This product is not for sale'
      
      await expect( ecommerce.buyProduct(id) ).to.be.revertedWith(reason); 
    })

    it('Should revert if trying to set a product for sale that does not exist', async function(){
      let id = '2936472532'
      let totalPrice = '1000' 
      let commision = '100'
      let finalPrice = '900'

      let reason = 'The product must exist to be purchased'
      
      await expect( ecommerce.isForSale(id, totalPrice, commision, finalPrice ) ).to.be.revertedWith(reason); 
    })

    it('Should revert if price of the product is 0', async function(){
      let id = '8'
      let totalPrice = '0' 
      let commision = '100'
      let finalPrice = '900'

      let reason = 'Price must be greater than 0'
      
      await expect( ecommerce.isForSale(id, totalPrice, commision, finalPrice ) ).to.be.revertedWith(reason); 
    })

    it('Should revert if commision plus the final price does not equal the total price', async function(){
      let id = '8'
      let totalPrice = '1000' 
      let commision = '100'
      let finalPrice = '9000'

      let reason = 'The commision plus the final price should be equal as the total price'
      
      await expect( ecommerce.isForSale(id, totalPrice, commision, finalPrice ) ).to.be.revertedWith(reason); 
    })

    it('Should set a product for sale successfully', async function(){
      let id = '8'
      let totalPrice = '1000' 
      let commision = '100'
      let finalPrice = '900'
      
      await  ecommerce.isForSale(id, totalPrice, commision, finalPrice ) 

      let product = await ecommerce.productById(id)

      expect (product['isForSale']).to.be.true

    })

    it('Should set totalPrice properly', async function(){
      let id = '8'
      let totalPrice = '1000' 
      
      let product = await ecommerce.productById(id)

      expect (product['totalPrice']).to.equal(totalPrice)
    })

    it('Should set commision properly', async function(){
      let id = '8'
      let commision = '100'
      
      let product = await ecommerce.productById(id)

      expect (product['commision']).to.equal(commision)
    })

    it('Should set finalPrice properly', async function(){
      let id = '8'
      let finalPrice = '900'
      
      let product = await ecommerce.productById(id)

      expect (product['finalPrice']).to.equal(finalPrice)
    })

    it('Should emit ProductForSale event', async function(){
      let id = '8'
      let totalPrice = '1000' 
      let commision = '100'
      let finalPrice = '900'
    
      let product = await ecommerce.productById(id)

      expect (await  ecommerce.isForSale(id, totalPrice, commision, finalPrice ))
      .to.emit(ecommerce, 'ProductForSale')
      .withArgs(id, totalPrice)

    })

    
  })
