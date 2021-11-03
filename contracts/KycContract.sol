//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract KycContract is Ownable {
    mapping(address => bool) allowed;

    function setSingleKyc(address _addr) public onlyOwner {
        allowed[_addr] = true;
    }

    function setMultipleKyc(address[] memory _addrs) public onlyOwner {
        for( uint256 i = 0; i< _addrs.length; i++){
            setSingleKyc(_addrs[i]);
        }
    }

    function revokeSingleKyc(address _addr) public onlyOwner {
        allowed[_addr] = false;
    }

    function revokeMultipleKyc(address[] memory _addrs) public onlyOwner {
        for( uint256 i = 0; i< _addrs.length; i++){
            revokeSingleKyc(_addrs[i]);
        }    
    }

    function kycCompleted(address _addr) public view returns(bool) {
        return allowed[_addr];
    }
}