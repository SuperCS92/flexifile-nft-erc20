//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Crowdsale/MintedCrowdsale.sol";
import "./KycContract.sol";

contract FlexiCoinSale is MintedCrowdsale {

   //Minimum investor constribution - 0.002
   uint256 public investorMinCap = 2_000_000_000_000_000;
   //Maximum investor contribution - 50
   uint256 public investorMaxCap = 50_000_000_000_000_000_000;

   mapping(address => uint256) public contributions; 

   bool public mintingFinished = false;

   event Mint(address indexed _to, uint256 _amount);
   event MintFinished();

   modifier canMint(){
      require(mintingFinished== false, "Minting  has finished");
      _;
   }

   modifier onlyIfWhiteListed( address _operator){
      require(kyc.kycCompleted(_operator) == true, "Operator not white listed");
      _;
   }

    KycContract kyc;
    constructor(uint256 _rate, address payable _wallet, IERC20 _token , KycContract _kyc
    ) 
     Crowdsale( _rate, _wallet, _token) 
     public
     { 
        kyc = _kyc;
     }

   function _preValidatePurchase(address _beneficiary, uint256 _weiAmount) 
   internal 
   view 
   override 
   onlyIfWhiteListed(_beneficiary)
    {
      super._preValidatePurchase(_beneficiary, _weiAmount);

      uint256 _existingContribution = contributions[_beneficiary];
      uint256 _newContribution = _existingContribution + _weiAmount;
      
      require(_newContribution >= investorMinCap && _newContribution <= investorMaxCap, "Investor cap out of boundaries"); 
      
   }


   function _updatePurchasingState(address _beneficiary, uint256 _weiAmount) internal override{
      super._updatePurchasingState(_beneficiary, _weiAmount);

      uint256 _existingContribution = contributions[_beneficiary];
      uint256 _newContribution = _existingContribution + _weiAmount;

      contributions[_beneficiary] = _newContribution;
   }

}