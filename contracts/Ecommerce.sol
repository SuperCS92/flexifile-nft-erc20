//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// Import Ownable from the OpenZeppelin Contracts library
import "@openzeppelin/contracts/access/Ownable.sol";
import "./EcommerceToken.sol";
import "./FlexiCoin.sol";

/// @notice The main ecommerce contract to buy and sell ERC-721 tokens representing physical or digital products because we are dealing with non-fungible tokens, there will be only 1 stock per product
contract Ecommerce is Ownable {

    struct Product {
        uint256 id;
        string title;
        string description;
        uint256 date;
        address payable owner;
        uint256 totalPrice;     //Price of product set by owner
        uint256 commision;      //Commision reclaimed by the Ecommerce
        uint256 finalPrice;     //Final price (Totalprice - commision)
        bool isForSale;
    }
  
    // Product id => product
    mapping(uint256 => Product) public productById;

     // Address where funds are collected
    address payable private _wallet;
   
    address public ERC721TOKEN;
    address public ERC20TOKEN;

    uint256 public NFTMINTPRICE;
    
    event ProductForSale(uint256 _id, uint256 _price);
    event ProductNotForSale(uint256 _id);
    event ProductSold(address buyer, uint256 _id);

    /// @notice To setup the address of the ERC-721 token to use for this contract
    /// @param _erc721token The ERC721 token address
    /// @param _erc20token The ERC20 token address
    constructor(address _erc721token, address _erc20token, uint256 _nftprice) {
        ERC721TOKEN = _erc721token;
        ERC20TOKEN = _erc20token;
        _wallet = payable(msg.sender);
        NFTMINTPRICE = _nftprice;
    }

    /// @notice To publish a product as a seller, note that the seller must authorize this contract to manage the token
    /// @param _id The hash of the file
    /// @param _to The addres of the owner
    /// @param _title The title of the product
    /// @param _description The description of the product
    function publishProductByOwner(uint256 _id, address _to ,string memory _title, string memory _description) public {
        _preValidatePublish(_id, msg.sender, _title, _description);

        _processPublish(_id, _to ,_title, _description, msg.sender);
    }

    /// @notice To publish a product as a seller, note that the seller must authorize this contract to manage the token
    /// @param _id The hash of the file
    /// @param _to The addres of the owner
    /// @param _title The title of the product
    /// @param _description The description of the product
    function publishProduct(uint256 _id, address _to ,string memory _title, string memory _description) public {
        _preValidatePublish(_id, msg.sender, _title, _description);

        _processPublish(_id, _to , _title, _description, msg.sender);
    }

    /// @notice To set a product for sale, emit a ProductForSale event
    /// @param _id The id of the product 
    /// @param _totalPrice The price of the product plus commision
    /// @param _commision The commision for the ecommerce
    /// @param _finalPrice The price of the product 
    function isForSale(uint256 _id, uint256 _totalPrice, uint256 _commision, uint256 _finalPrice ) onlyOwner public {
        _preValidateForSale(_id, _totalPrice, _commision, _finalPrice);

        _processForSale(_id, _totalPrice, _commision, _finalPrice);
        
        emit ProductForSale(_id, _totalPrice);
    }

    /// @notice The product is no longer for sale
    /// @param _id The id of the product 
    function notForSale(uint256 _id) onlyOwner public  {
        _preValidateNotForSale(_id);

        _processNotForSale(_id );
        
        emit ProductNotForSale(_id);
    }

    /// @notice To buy a new product, emit a ProductSold event
    /// @param _id The id of the product to buy
    function buyProduct(uint256 _id) public payable {
        
        _preValidateBuyProduct(_id, msg.sender, msg.value);

        _processBuyProduct(_id, msg.sender);

        _forwardCommision(_id);
        
        _updatePurchasingState(_id, msg.sender);
        
        emit ProductSold(msg.sender, _id);
    }

    function _forwardCommision(uint256 _id) internal {
     Product memory p = productById[_id];

     uint256 priceWithoutCommision = p.totalPrice - p.commision;

     _wallet.transfer(msg.value - priceWithoutCommision);
    }

    function _updatePurchasingState(uint256 _id, address _sender) internal {
        productById[_id].isForSale = false;
        productById[_id].owner = payable(_sender);
    }

    function _processBuyProduct(uint256 _id,address _sender) internal {
        Product memory p = productById[_id];
        p.owner.transfer(msg.value - p.commision);
        EcommerceToken(ERC721TOKEN).transferFrom(p.owner, _sender, _id); // Transfer the product token to the new owner
        EcommerceToken(ERC721TOKEN).approve(address(this), _id);
    }

    function _preValidateBuyProduct(uint256 _id, address _sender, uint256 _value) internal view {
        Product memory p = productById[_id];
        address owner = p.owner;
        require(bytes(p.title).length > 0, 'The product must exist to be purchased');
        require(p.isForSale == true, 'This product is not for sale');
        require(owner != _sender, "The owner of this product can not buy it");
        require(_value == p.totalPrice, "The payment must be equal than the products price");
    }

    function _preValidatePublish(uint256 _id, address _to, string memory _title, string memory _description) internal view {
        require(_id > 0, 'The id cannot be empty');
        require(bytes(_title).length > 0, 'The title cannot be empty');
        require(bytes(_description).length > 0, 'The description cannot be empty');

        if(_to != owner()){
        uint256 _balance = ERC20(ERC20TOKEN).balanceOf(_to);
        require(_balance >= NFTMINTPRICE, "Insufficient balance to mint an NFT");
        }
    }

    function _processPublish(uint256 _id, address _to ,string memory _title, string memory _description, address _sender) internal {

        if(_sender != owner()){
        FlexiCoin(ERC20TOKEN).burn(_sender,NFTMINTPRICE);
        }

        Product memory p = Product(_id, _title, _description, block.timestamp, payable(_to), 0,0,0, false);
        productById[_id] = p;

        EcommerceToken(ERC721TOKEN).mint(_to, _id); // Create a new token for this product which will be owned by this contract until sold
        EcommerceToken(ERC721TOKEN).approve(address(this), _id);
    }

    function _preValidateForSale(uint256 _id, uint256 _totalPrice, uint256 _commision, uint256 _finalPrice) internal view{
        Product memory p = productById[_id];
        require(bytes(p.title).length > 0, 'The product must exist to be purchased');
        require(_totalPrice > 0, 'Price must be greater than 0');
        require(_totalPrice == _commision + _finalPrice, 'The commision plus the final price should be equal as the total price');
    
    }

    function _processForSale(uint256 _id, uint256 _totalPrice, uint256 _commision, uint256 _finalPrice) internal  {
        productById[_id].isForSale = true;
        productById[_id].totalPrice = _totalPrice;
        productById[_id].commision = _commision;
        productById[_id].finalPrice = _finalPrice;
    }

    function _preValidateNotForSale(uint256 _id) internal view {
        Product memory p = productById[_id];
        require(bytes(p.title).length > 0, 'The product must exist');
        require(p.isForSale == true, 'The product is not for sale');
    }

    function _processNotForSale(uint256 _id ) internal {
        productById[_id].isForSale = false;
        productById[_id].totalPrice = 0;
        productById[_id].commision = 0;
        productById[_id].finalPrice = 0;
    }
    
    function _withdraw(uint256 _amount, address payable _add) public onlyOwner {
     _add.transfer(_amount);
    }

  

}