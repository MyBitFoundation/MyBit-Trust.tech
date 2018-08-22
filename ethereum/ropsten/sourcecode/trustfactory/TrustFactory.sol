pragma solidity ^0.4.24;

import './SafeMath.sol';
import './Trust.sol'; 

// @title A factory contract that deploys new Trust contracts
contract TrustFactory { 


  // @notice trustors can deploy new trust contracts here 
  // @param (address) _beneficiary = The address who is to receive ETH from Trust
  // @param (bool) _revokeable = Whether or not trustor is able to revoke contract or change _beneficiary
  // @param (uint) _blocksUntilExpiration = Number of Ethereum blocks until Trust expires
  function deployTrust(address _beneficiary, bool _revokeable, uint _blocksUntilExpiration)
  external 
  payable { 
    require(msg.value > 0); 
    Trust newTrust = new Trust(msg.sender, _beneficiary, _revokeable, _blocksUntilExpiration); 
    newTrust.depositTrust.value(msg.value)();
    emit LogNewTrust(msg.sender, _beneficiary, address(newTrust), msg.value);
  }


  event LogNewTrust(address indexed _trustor, address indexed _beneficiary, address _trustAddress, uint _amount); 





}
