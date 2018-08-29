import React from 'react';
import styled from 'styled-components';
import NavigationBar from '../NavigationBar';
import ParticlesOverlay from '../ParticlesOverlay';
import Button from '../Button';
import Constants from '../Constants';

const StyledHeader = styled.header`
  height: 150px;
`;

const Header = ({ logo }) => {
    const pathName = window.location.pathname;

    const navigationLinks = [
    {
      text: 'How it works',
      linkTo: '/',
      isActive: pathName === "/"
    },{
      text: 'Tx History',
      linkTo: '/transactions',
      isActive: pathName === "/transactions"
    },{
      text: 'Redeem',
      linkTo: '/redeem',
      isActive: pathName === "/redeem"
    }
  ];

  return(
    <StyledHeader>
      <ParticlesOverlay/>
      {logo}
      <NavigationBar
        links={navigationLinks}
        shouldAddCreateNewButton={pathName !== "/"}
      />
    </StyledHeader>
  )

}

export default Header;
