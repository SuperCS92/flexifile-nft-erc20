const { ethers } = require("hardhat");

async function main() {
 
    const [deployer] = await ethers.getSigners();
 
    console.log(
      "Deploying contracts with the account:",
      deployer.address
    );
 
    console.log("Account balance:", (await deployer.getBalance()).toString());
 
    const EcommerceToken = await ethers.getContractFactory("EcommerceToken");
    const EcommerceTokenDeployedContract = await EcommerceToken.deploy("FlexiToken", "FLX");
    console.log("Deployed EcommerceToken contract address:", EcommerceTokenDeployedContract.address);

    const FlexiCoin = await ethers.getContractFactory("FlexiCoin");
    const FlexiCoinContract = await FlexiCoin.deploy();
    console.log("Deployed FlexiCoin contract address:", FlexiCoinContract.address);


    let EcommerceTokenContractAddress = EcommerceTokenDeployedContract.address;
    let FlexiCoinContractAddress = FlexiCoinContract.address;
    const Ecommerce = await ethers.getContractFactory("Ecommerce");
    const EcommerceDeployedContract = await Ecommerce.deploy(EcommerceTokenContractAddress,FlexiCoinContractAddress);
    console.log("Deployed Ecommerce contract address:", EcommerceDeployedContract.address);
 

    let EcommerceContractAddress = EcommerceDeployedContract.address;
    const tx = await EcommerceTokenDeployedContract.setEcommerce(EcommerceContractAddress);

    console.log("Transaction hash for setting Ecommerce:", tx.hash);


    let address = await EcommerceTokenDeployedContract.ecommerce()
    console.log('Ecommerce address in NFT contract is: ', address)

    let totalSupply = await FlexiCoinContract.totalSupply().toString();
    console.log('Total supply: ', totalSupply)


  }
 
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
