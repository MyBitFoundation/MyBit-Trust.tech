pragma solidity ^0.4.24;

import './Trust.sol';
import './TrustERC20.sol';
import './TrustERC721.sol';
import './MyBitBurner.sol';


// @title A factory contract that deploys new Trust contracts
// @author Kyle Dewhurst, MyBit Foundation
// @notice A contract which deploys Trust contracts
contract TrustFactory {

  bool public expired;    // When true, it will stop the factory from making more Trust contracts
  address public owner;    // Owner of the trust factory

  MyBitBurner public mybBurner;         // The MyBitBurner contract instance

  uint public mybFee = uint256(250*10**18);     // How much MYB to burn in order to create a Trust

  // @notice constructor: sets msg.sender as the owner, who has authority to close the factory
  constructor(address _mybTokenBurner)
  public {
    owner = msg.sender;
    mybBurner = MyBitBurner(_mybTokenBurner);
  }

  // @notice trustors can deploy new trust contracts here
  // @param (address) _beneficiary = The address who is to receive ETH from Trust
  // @param (bool) _revokeable = Whether or not trustor is able to revoke contract or change _beneficiary
  // @param (uint) _expiration = Number of seconds until Trust expires
  function deployTrust(address _beneficiary, bool _revokeable, uint _expiration, address _burnToken)
  external
  payable {
    require(msg.value > 0);
    require(!expired);
    uint amount;
    //If burn token is Ether, burn a portion of the trust Ether to pay fees, else burn the token indicated
    if(_burnToken == address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE)){
      amount = ethBurn(msg.value);
    } else {
      require(mybBurner.burn(msg.sender, mybFee, _burnToken));
      amount = msg.value;
    }
    Trust newTrust = new Trust(msg.sender, _beneficiary, _revokeable, _expiration);
    newTrust.depositTrust.value(amount)();
    emit LogNewTrust(msg.sender, _beneficiary, address(newTrust), amount);
  }

  // @notice TrustERC20 should be deployed in 2 steps to allow authorization to spend tokens
  // @param (address) _beneficiary = The address who is to receive tokens from Trust
  // @param (bool) _revokeable = Whether or not trustor is able to revoke contract or change _beneficiary
  // @param (uint) _expiration = Number of seconds until Trust expires
  // @param (address) _tokenContractAddress = The address of the contract of the token which should be used for the trust
  function createTrustERC20(address _beneficiary, bool _revokeable, uint _expiration, address _tokenContractAddress, address _burnToken)
  external
  payable{
    require(!expired);
    require(mybBurner.burn.value(msg.value)(msg.sender, mybFee, _burnToken));
    TrustERC20 newTrust = new TrustERC20(msg.sender, _beneficiary, _revokeable, _expiration, _tokenContractAddress);
    emit LogNewTrustERC20(msg.sender, _beneficiary, address(newTrust));
  }

  // @notice TrustERC721 should be deployed in 2 steps to allow authorization to spend tokens
  // @param (address) _beneficiary = The address who is to receive tokens from Trust
  // @param (bool) _revokeable = Whether or not trustor is able to revoke contract or change _beneficiary
  // @param (uint) _expiration = Number of seconds until Trust expires
  // @param (address) _tokenContractAddress = The address of the contract of the token which should be used for the trust
  function createTrustERC721(address _beneficiary, bool _revokeable, uint _expiration, address _tokenContractAddress, address _burnToken)
  external
  payable{
    require(!expired);
    require(mybBurner.burn.value(msg.value)(msg.sender, mybFee, _burnToken));
    TrustERC721 newTrust = new TrustERC721(msg.sender, _beneficiary, _revokeable, _expiration, _tokenContractAddress);
    emit LogNewTrustERC721(msg.sender, _beneficiary, address(newTrust));
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

  // @notice burn fees from Ether payment given, return the change after convert+burn
  function ethBurn(uint _amount)
  private
  returns (uint) {
    uint balanceBefore = address(this).balance;
    require(mybBurner.burn.value(_amount)(address(this), mybFee, address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE)));
    uint change = _amount - (balanceBefore - address(this).balance);
    require(change <= address(this).balance, "Uh-oh, not enough funds");
    return change;
  }

  // @notice fallback function. Needs to be open to receive returned Ether from ethBurn()
  function () external payable {}


  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //                                            Modifiers
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // @notice reverts if msg.sender isn't the owner
  modifier onlyOwner {
    require(msg.sender == owner);
    _;
  }

  event LogNewTrust(address indexed _trustor, address indexed _beneficiary, address _trustAddress, uint _amount);
  event LogNewTrustERC20(address indexed _trustor, address indexed _beneficiary, address _trustAddress);
  event LogNewTrustERC721(address indexed _trustor, address indexed _beneficiary, address _trustAddress);
  event LogMYBFeeChange(uint _oldFee, uint _newFee);
}
