pragma solidity ^0.4.24;

import '../SafeMath.sol';
import '../interfaces/PullPayment.sol';

// @title A contract made to equally distribute payments amongs a list of beneficiaries
// @author Kyle Dewhurst, MyBit Foundation
// @notice This contract allows someone to leave ETH for a list of beneficiaries
// @dev contract only saves minimal information. Beneficiary list must be re-constructed using event logs
// TODO: test up to what length of beneficiaries this saves any gas
contract EqualDistributionLight {
  using SafeMath for uint;


  PullPayment public pullPayment;                // Interface for withdrawing funds from contracts

  address public operator;    // Creator of distribution contract

  bytes32 public beneficiaryListHash = keccak256("helloworld");      // The initial hash that is used to store a proof of each beneficiary

  mapping (address => bool) public checkPoints;              // Used as proofs at the beginning and end of arrays to prove the list is valid

  uint public totalReleased;                        // Total WEI so far released to beneficiaries
  mapping (address => uint) public amountRedeemed;           // Amount WEI released to a particular beneficiary




  // @notice doesn't save the addresses of all beneficiaries, but saves a hash which can later be used to prove beneficiary address
  // @dev look through LogBeneficiary event logs to find all addresses
  // @param _beneficiaries (address) = The ETH addresses of who is to receive income
  // TODO: move this out of constructor
  constructor(address[] _beneficiaries)
  public
  payable {
    require(_beneficiaries.length < 50);
    operator = msg.sender;
    checkPoints[_beneficiaries[0]] = true;
    checkPoints[_beneficiaries[_beneficiaries.length]] = true;
    beneficiaryListHash = keccak256(abi.encodePacked(_beneficiaries[0], beneficiaryListHash));
    for (uint i =1; i < _beneficiaries.length; i++){
      beneficiaryListHash = keccak256(abi.encodePacked(_beneficiaries[i], beneficiaryListHash));
      emit LogBeneficiary(_beneficiaries[i]);
    }
  }

  // @notice allows beneficiaries to withdraw from contracts at different locations to be re-distributed here
  // @dev can call withdraw() on any address if there are no parameters required. Fallback function will be triggered
  // @param (address) _contractAddress = The address to call withdraw() on.
  function getFunds(address _contractAddress)
  external
  returns (bool) {
    require(PullPayment(_contractAddress).withdraw());
    return true;
  }

  // @notice beneficiaries can withdraw their share of the income here
  function withdraw(address[] _beneficiaries)
  external
  returns (bool) {
    require(isABeneficiary(msg.sender, _beneficiaries));
    uint amount = address(this).balance.add(totalReleased).div(_beneficiaries.length).sub(amountRedeemed[msg.sender]);
    amountRedeemed[msg.sender] = amountRedeemed[msg.sender].add(amount);
    totalReleased = totalReleased.add(amount);
    msg.sender.transfer(amount);
    emit LogWithdraw(msg.sender, amount);
  }

  // @notice check if the address is one of the beneficiaries
  // @dev will loop through verificationHashes to check if _user is a _beneficiary
  // @dev _beneficiary list must contain every beneficiary in the correct order
  // @param (address) _user = The address to query if it is a beneficiary
  // @param (address[]) _beneficiaries = The list of beneficiaries on the platform
  function isABeneficiary(address _user, address[] _beneficiaries)
  public
  view
  returns (bool isBeneficiary) {
    bytes32 verificationHash = keccak256("helloworld");
    require(checkPoints[_beneficiaries[0]] && checkPoints[_beneficiaries[_beneficiaries.length]]);
    for (uint i = 0; i < _beneficiaries.length; i++) {
      verificationHash = keccak256(abi.encodePacked(verificationHash, _beneficiaries[i]));
      if (_beneficiaries[i] == _user) { isBeneficiary = true; }
    }
    return (verificationHash == beneficiaryListHash) && isBeneficiary;
  }


  // @notice fallback function
  function ()
  public
  payable {
    emit LogPayment(msg.sender, msg.value);
  }

  event LogBeneficiary(address _beneficiary);
  event LogPayment(address _sender, uint _amount);
  event LogWithdraw(address _beneficiary, uint _amount);

}
