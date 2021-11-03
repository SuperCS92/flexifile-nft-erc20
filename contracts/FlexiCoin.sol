//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "@openzeppelin/contracts/access/AccessControl.sol";

// Import ERC20 from the OpenZeppelin Contracts library
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";

// Import Ownable from the OpenZeppelin Contracts library
import "@openzeppelin/contracts/access/Ownable.sol";

contract FlexiCoin is ERC20Pausable, Ownable, AccessControl {

    //Role identifiers
    bytes32 constant public MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 constant public ICO_MINT = 90_000_000*10**18;

    uint256 constant public AMOUNTMINT = 16_000_000*10**18;

    uint256 constant public SELL_LIMIT = 30*10**18;
    uint256 constant public REWARD_LIMIT = 10*10**18;
    uint256 public amount_reward = 0;
    uint256 private amount_sell = 0;
    uint256 public PRICE = 5000000000000000;

    
    constructor() ERC20("FlexiCoin", "FLC") {
        _mint(msg.sender, AMOUNTMINT);

        // Grant the contract deployer the default admin role: it will be able
        // to grant and revoke any roles
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function setMinterRole(address _account) public onlyOwner{
        grantRole(MINTER_ROLE,  _account);
    }

    function burn(address account, uint256 amount) public {
        _burn(account, amount);
    }

    function mint(address _account, uint256 _amount) public returns (bool) {
        require(amount_sell + _amount <= ICO_MINT, "ICO sell limit has been reached");
        require(hasRole(MINTER_ROLE, msg.sender), "Caller is not a minter");
        _mint( _account,  _amount);
        
        amount_sell += _amount;

        return true;
    }
    
    function lock( address _lock1, address _lock2, address _lock3, address _lock4) public onlyOwner{
       _mint(_lock1, AMOUNTMINT);
       _mint(_lock2, AMOUNTMINT);
       _mint(_lock3, AMOUNTMINT);
       _mint(_lock4, AMOUNTMINT);
    }

    
    function buyCoin(uint256 _amount) payable public returns(bool) {
        require(amount_sell + _amount*10**18 <= SELL_LIMIT, 'Limit reach');
        require(msg.value == _amount*PRICE, 'Insufficient pay');
        
        amount_sell += _amount*10**18;
        _mint(msg.sender, _amount*10**18);
        
        return true;
    }

    function reward(uint256 _amount, address _add) public onlyOwner {
        require(amount_reward + _amount*10**18 <= REWARD_LIMIT, 'Limit reach');
        _mint(_add, _amount);
        
        //Emit RewardEvent
    }

    function withdraw(uint256 _amount, address payable _add) public onlyOwner {
     _add.transfer(_amount);
    }

    function getAmount_sell() public view returns(uint256){
        return amount_sell;
    }
    
}
