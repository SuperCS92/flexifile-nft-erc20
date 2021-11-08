//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// Import Ownable from the OpenZeppelin Contracts library
import "@openzeppelin/contracts/access/Ownable.sol";
// Import ERC721 from the OpenZeppelin Contracts library
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/// @notice The Ecommerce Token that implements the ERC721 token with mint function
/// @author Merunas Grincalaitis <merunasgrincalaitis@gmail.com>
contract EcommerceToken is ERC721, Ownable {
    address public ecommerce;
    bool public isEcommerceSet = false;
    
    /**
     * @dev Initializes the contract by setting a `name` and a `symbol` to the token collection.
     */
    constructor (string memory name_, string memory symbol_) ERC721(name_, symbol_) {
        
    }
    
    /// @notice To generate a new token for the specified address
    /// @param _to The receiver of this new token
    /// @param _tokenId The new token id, must be the hash of the file
    function mint(address _to, uint256 _tokenId) public {
        require(msg.sender == ecommerce, 'Only the ecommerce contract can mint new tokens');
        _safeMint(_to, _tokenId);
        
    }
    
     /**
     * @dev See {IERC721-approve}.
     */
    function approve(address to, uint256 tokenId) public virtual override {
        address owner = ERC721.ownerOf(tokenId);
        require(to != owner, "ERC721: approval to current owner");

        require(_msgSender() == ecommerce ||_msgSender() == owner || isApprovedForAll(owner, _msgSender()),
            "ERC721: approve caller is not owner nor approved for all"
        );

        _approve(to, tokenId);
    }

    /// @notice To set the ecommerce smart contract address
    function setEcommerce(address _ecommerce) public  onlyOwner{
        require(!isEcommerceSet, 'The ecommerce address can only be set once');
        require(_ecommerce != address(0), 'The ecommerce address cannot be empty');
        isEcommerceSet = true;
        ecommerce = _ecommerce;
    }
    
    /// @notice To remove the ecommerce smart contract address
    function removeEcommerce()  public onlyOwner{
        require(isEcommerceSet, 'The ecommerce must be set');
        require(msg.sender != ecommerce, 'Only the ecommerce address can remove itself');
        isEcommerceSet = false;
        ecommerce = address(0); 
    }
}


