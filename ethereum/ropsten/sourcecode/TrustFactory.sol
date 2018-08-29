pragma solidity ^0.4.24;

import './Trust.sol';
import './MyBitBurner.sol';


// @title A factory contract that deploys new Trust contracts
// @author Kyle Dewhurst, MyBit Foundation
// @notice A contract which deploys Trust contracts
contract TrustFactory {

  bool public expired;    // When true, it will stop the factory from making more Trust contracts
  address public owner;    // Owner of the trust factory

  MyBitBurner public mybBurner;         // The MyBitBurner contract instance

  uint public mybFee = uint(250 * 10**18);     // How much MYB to burn in order to create a Trust

  // @notice constructor: sets msg.sender as the owner, who has authority to close the factory
  constructor(address _mybTokenBurner)
  public {  
    owner = msg.sender; 
    mybBurner = MyBitBurner(_mybTokenBurner); 
  }

  // @notice trustors can deploy new trust contracts here
  // @param (address) _beneficiary = The address who is to receive ETH from Trust
  // @param (bool) _revokeable = Whether or not trustor is able to revoke contract or change _beneficiary
  // @param (uint) _blocksUntilExpiration = Number of Ethereum blocks until Trust expires
  function deployTrust(address _beneficiary, bool _revokeable, uint _blocksUntilExpiration)
  external
  payable {
    require(msg.value > 0);
    require(!expired);
    require(mybBurner.burn(msg.sender, mybFee));
    Trust newTrust = new Trust(msg.sender, _beneficiary, _revokeable, _blocksUntilExpiration);
    newTrust.depositTrust.value(msg.value)();
    emit LogNewTrust(msg.sender, _beneficiary, address(newTrust), msg.value);
  }

  // @notice If called by owner, this function prevents more Trust contracts from being made once
  // @notice Old contracts will continue to function
  function closeFactory()
  onlyOwner
  external {
    require (!expired);
    expired = true;
  }

  // @notice can change how much MYB is burned for creating Trusts
  function changeMYBFee(uint _newFee)
  onlyOwner
  external {
    uint oldFee = mybFee; 
    mybFee = _newFee;
    emit LogMYBFeeChange(oldFee, mybFee);
  }

  // @notice fallback function. Rejects all ether 
  function ()
  external { 
    revert(); 
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //                                            Modifiers
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // @notice reverts if msg.sender isn't the owner
  modifier onlyOwner {
    require(msg.sender == owner);
    _;
  }

  event LogNewTrust(address indexed _trustor, address indexed _beneficiary, address _trustAddress, uint _amount);
  event LogMYBFeeChange(uint _oldFee, uint _newFee); 
}
