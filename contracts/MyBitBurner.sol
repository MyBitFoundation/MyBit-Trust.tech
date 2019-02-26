pragma solidity ^0.4.24;

import "./SafeMath.sol";
import './token/BurnableERC20.sol';
import './token/ERC20.sol';
interface KyberProxy{
  function getExpectedRate(address src, address dest, uint srcQty) external view returns (uint expectedRate, uint slippageRate);
  function trade(address src, uint srcAmount, address dest, address destAddress, uint maxDestAmount,uint minConversionRate, address walletId) external payable returns(uint);
}
/// @title A contract for burning MYB tokens as usage fee for dapps
/// @author Kyle Dewhurst, MyBit Foundation
/// @notice Allows Dapps to call this contract to burn MYB as a usage fee
/// @dev This contract does not accept tokens. It only burns tokens from users wallets when approved to do so
contract MyBitBurner {
  using SafeMath for uint256;

  BurnableERC20 public mybToken;  // The instance of the MyBitBurner contract
  KyberProxy public kyber; // The interface for trading on Kyber
  address public owner;           // Owner can add or remove authorized contracts
  uint256 decimals;

  mapping (address => bool) public authorizedBurner;    // A mapping showing which addresses are allowed to call the burn function

  // @notice constructor: instantiates myb token address and sets owner
  // @param (address) _myBitTokenAddress = The MyBit token address
  constructor(address _myBitTokenAddress, address _kyberAddress)
  public {
    mybToken = BurnableERC20(_myBitTokenAddress);
    kyber = KyberProxy(_kyberAddress);
    owner = msg.sender;
    uint dec = mybToken.decimals();
    decimals = 10**dec;
  }

  // @notice authorized contracts can burn mybit tokens here if the user has approved this contract to do so
  // @param (address) _tokenHolder = the address of the mybit token holder who wishes to burn _amount of tokens
  // @param (uint) _amount = the amount of tokens to be burnt (must include decimal places)
  // @param (address) _burnToken = the address of the token that is being used to pay the fee
  function burn(address _tokenHolder, uint _amount, address _burnToken)
  payable
  external
  returns (bool) {
    require(authorizedBurner[msg.sender]);
    if(_burnToken == address(mybToken)){
      require(mybToken.burnFrom(_tokenHolder, _amount));
      emit LogMYBBurned(_tokenHolder, msg.sender, _amount);
    } else {
      //Calculate the estimate cost of given ERC20 to get convert to correct amount of platform token
      (uint expectedRate, uint minRate) = kyber.getExpectedRate(_burnToken, address(mybToken), 0);
      uint estimatedCost = expectedRate.mul(_amount).div(decimals);
      if(_burnToken == address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE)){
        //Ether was chosen as the burn token
        require(msg.value >= estimatedCost, 'Not enough funds');
        convert(_tokenHolder, _burnToken, address(mybToken), msg.value, _amount, minRate, true);
      } else {
        ERC20 burnToken = ERC20(_burnToken);
        //Transfer burn token from the user
        require(burnToken.transferFrom(_tokenHolder, address(this), estimatedCost));
        // Mitigate ERC20 Approve front-running attack, by initially setting
        // allowance to 0
        require(burnToken.approve(address(kyber), 0));
        // Approve tokens so network can take them during the swap
        burnToken.approve(address(kyber), estimatedCost);
        convert(_tokenHolder, _burnToken, address(mybToken), estimatedCost, _amount, minRate, false);
      }
      //Get amount of the platform token held by this contract (in case it differs from the _amount parameter)
      uint amount = mybToken.balanceOf(this);
      //Burn the platform token
      require(mybToken.burn(amount));
      emit LogMYBBurned(_tokenHolder, msg.sender, amount);
    }
    return true;
  }

  function convert(address _user, address _from, address _to, uint _amount, uint _max, uint _minRate, bool _eth)
  private
  returns (uint){
    uint balanceBefore;
    uint change;
    emit LogTrade(_from, _amount, _to, address(this), _max, _minRate, address(0));
    if(_eth == true){
      require(_amount <= address(this).balance, "Not enough funds in contract");
      balanceBefore = address(this).balance;
      kyber.trade.value(_amount)(_from, _amount, _to, address(this), _max, _minRate, 0);
      change = _amount.sub(balanceBefore.sub(address(this).balance));
      _user.transfer(change);
    } else {
      ERC20 erc20 = ERC20(_from);
      balanceBefore = erc20.balanceOf(this);
      kyber.trade(_from, _amount, _to, address(this), _max, _minRate, 0);
      change = _amount.sub(balanceBefore.sub(erc20.balanceOf(this)));
      erc20.transfer(_user, change);
    }
    return change;
  }

  // @notice owner can authorize a contract to burn MyBit here
  // @param the address of the mybit dapp contract
  function authorizeBurner(address _burningContract)
  external
  onlyOwner
  returns (bool) {
    require(!authorizedBurner[_burningContract]);
    authorizedBurner[_burningContract] = true;
    emit LogBurnerAuthorized(msg.sender, _burningContract);
    return true;
  }

  // @notice owner can revoke a contracts authorization to burn MyBit here
  // @param the address of the mybit dapp contract
  function removeBurner(address _burningContract)
  external
  onlyOwner
  returns (bool) {
    require(authorizedBurner[_burningContract]);
    delete authorizedBurner[_burningContract];
    emit LogBurnerRemoved(msg.sender, _burningContract);
    return true;
  }

  // @notice fallback function. Needs to be open to receive returned Ether from kyber.trade()
  function() external payable {}

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //                                            Modifiers
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // @notice reverts if msg.sender isn't the owner
  modifier onlyOwner {
    require(msg.sender == owner);
    _;
  }

  event LogMYBBurned(address indexed _tokenHolder, address indexed _burningContract, uint _amount);
  event LogBurnerAuthorized(address _owner, address _burningContract);
  event LogBurnerRemoved(address _owner, address _burningContract);
  event LogTrade(address src, uint amount, address dest, address receiver, uint max, uint minRate, address walletID);
}
