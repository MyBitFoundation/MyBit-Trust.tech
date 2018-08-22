pragma solidity ^0.4.24;

import './SafeMath.sol';

// @title Trust contract
// @notice This contract allows someone to leave ETH for a beneficiary once expiration is reached
// @dev Can extend the beneficiary for multiple accounts by setting beneficiary to a multi-owned contract
contract Trust {
	using SafeMath for uint;

	address public trustor;        // Creator of the trust
	address public beneficiary;    // Recipient of the trust 

	bool public revokeable;      // Can the trustor revoke the trust?

	uint public expiration;    // Number of blocks until trust expires

	uint public trustBalance;    // Amount of WEI intended for beneficiary


	// @notice Constructor: Deploy Trust contract 
	// @param (address) _trustor = The address that is depositing ETH for the _beneficiary
	// @param (address) _beneficiary = The ETH address of who is to receive the trustBalance
	// @param (bool) _revokeable = Can the trustor revoke the contract at any point before the expiration? 
	// @param (uint) _expiration = Number of blocks until the trust is redeemable? (in seconds)
	constructor(address _trustor, address _beneficiary, bool _revokeable, uint _expiration)
	public {
		trustor = _trustor;
		beneficiary = _beneficiary;
		revokeable = _revokeable;
		expiration = block.number.add(_expiration);
	}
	
	// @notice trustor can deposit WEI here
	// TODO: Should we limit this to one deposit? 
	function depositTrust()
	external 
	lessThan(0, msg.value)
	lessThan(block.number, expiration)
	payable { 
	   trustBalance = trustBalance.add(msg.value); 
	   emit LogDeposit(msg.sender, msg.value); 
	}

	// @notice trustor can revoke the contract if revokeable == true
	// TODO: kill the contract? 
	function revoke()
	external
	lessThan(block.number, expiration)
	onlySender(trustor)
	isRevokeable
	returns (bool) {
		uint amount = trustBalance;
		trustBalance = 0;
		trustor.transfer(amount);
		emit LogTrustRevoked(trustor, amount); 
		return true;
	}

	// @notice _beneficiary can withdraw trustBalance once expiration is reached 
	function withdraw()
	external
	lessThan(expiration, block.number)
	onlySender(beneficiary)
	returns (bool) {
		uint amount = trustBalance;
		delete trustBalance;
		beneficiary.transfer(amount);
		emit LogWithdraw(beneficiary, amount); 
		return true;
	}

	// @notice this allows the expiration of the trust to be changed to _numBlocks from block.number 
	// @param (uint) _numBlocks = Trust will expire in _numBlocks 
	function changeExpiration(uint _numBlocks) //Note: This should throw if change is a negative number
	external
	lessThan(block.number, expiration)
	onlySender(trustor)
	isRevokeable
	returns (bool){
		uint oldExpiration = expiration; 
		expiration = block.number.add(_numBlocks);  
		emit LogExpirationChanged(oldExpiration, expiration); 
		return true;
	}

	// @notice trustor can change the recipient of the trust if it has not yet expired
	function changeBeneficiary(address _beneficiary)
	external
	lessThan(block.number, expiration)
	onlySender(trustor)
	isRevokeable
	returns (bool){
		require(_beneficiary != address(0)); 
		emit LogNewBeneficiary(beneficiary, _beneficiary);
		beneficiary = _beneficiary;
		return true;
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//																						View Functions
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// @notice helper function. Returns number of seconds until Trust expires
	function blocksUntilExpiration()
	external 
	view 
	returns (uint) { 
		if (expiration < block.number) { return 0; }
		return expiration.sub(block.number); 
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//																						Modifiers
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// @notice reverts if _a >= _b 
	modifier lessThan(uint _a, uint _b) { 
		require(_a < _b); 
		_;
	}

	// @notice reverts if msg.sender != _expectedCaller
	modifier onlySender(address _expectedCaller) { 
		require(msg.sender == _expectedCaller); 
		_;
	}

	// @notice reverts if trust is not revokeable
	modifier isRevokeable { 
		require(revokeable); 
		_;
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//																						Events
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	event LogDeposit(address _sender, uint _amount); 
	event LogWithdraw(address _beneficiary, uint _amount); 
	event LogNewBeneficiary(address _oldBeneficiary, address _newBeneficiary); 
	event LogTrustRevoked(address _trustor, uint _amount); 
	event LogExpirationChanged(uint _oldExpiration, uint _newExpiration); 

}