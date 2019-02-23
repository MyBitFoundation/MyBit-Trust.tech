pragma solidity ^0.4.24;

import "../token/ERC20.sol";

interface SanityRatesInterface {
    function getSanityRate(ERC20 src, ERC20 dest) external view returns(uint);
}
