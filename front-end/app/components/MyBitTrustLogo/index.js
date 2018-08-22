import React from 'react';
import styled from 'styled-components'
import { Link } from 'react-router-dom';
import Logo from './logo.svg';
import Img from '../Img';

const StyledLogo = styled(Link)`
  position: absolute;
  top: 21px;
  left: 21px;
`

const MyBitTrustLogo = (
    <StyledLogo to="/">
      <Img
        src={Logo}
        alt="MyBit Trust Dapp"
      />
    </StyledLogo>
);

export default MyBitTrustLogo;
