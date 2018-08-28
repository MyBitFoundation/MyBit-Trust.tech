import React from 'react';
import styled from 'styled-components';
import Button from '../Button';
import Constants from '../Constants';
import SidebarMobile from './sidebarMobile';
import HamburgerButton from './menu-icon.svg'
import Img from '../Img';

const StyledNav = styled.nav`

  .NavigationBar--is-desktop{
    display: flex;
    flex-direction: row;
    width: max-content;
    margin: 0 auto;
    margin-top: 30px;

    @media (max-width: 850px) {
      display: none;
    }
  }

  .Hamburger-button{
    position: absolute;
    right: 20px;
    top: 45px;
    cursor: pointer;

    @media (min-width: 850px) {
      display: none;
    }
  }
`;

const StyledNavLink = styled.div`
  margin: 10px;
`;

const StyledContributeButton = styled.div`
    position: absolute;
    top: 40px;
    right: 30px;
`;

class NavigationBar extends React.Component {
  constructor(props){
   super(props);
   this.state = {popup: false}

   this.handleClick = this.handleClick.bind(this);
  }

  handleClick(flag){
    this.setState({popup: flag});
  }

  render(){
    const {links, shouldAddCreateNewButton} = this.props;

    const toRender = links.map(link => (
      <StyledNavLink
        key={link.text}
      >
        <Button
          styling={Constants.buttons.secondary.default}
          linkTo={link.linkTo}
          isActive={link.isActive}
        >
          {link.text}
         </Button>
       </StyledNavLink>
    ))

    let contributeButton = undefined;

    //Add "create new" button to nav bar
    if(shouldAddCreateNewButton){
      toRender.push(
        <StyledNavLink
        >
          <Button
            styling={Constants.buttons.primary.green}
            linkTo="/create-new"
          >
            Start your fund
           </Button>
         </StyledNavLink>
      )
      contributeButton = (
        <StyledContributeButton>
          <Button
            styling={Constants.buttons.secondary.default}
            href="https://mybit.io"
            tooltipTitle="Make this dApp awesome here."
            tooltipPlacement="bottomLeft"
            hasTooltip
            pointArrowAtCenter
          >
            Contribute
           </Button>
         </StyledContributeButton>
      )
    }

    return(
      <StyledNav>
        <div
          className="Hamburger-button"
        >
          <a onClick={() => this.handleClick(true)}>
            <Img
              src={HamburgerButton}
              alt="Mobile menu button"
            />
          </a>
        </div>
        <SidebarMobile
          open={this.state.popup}
          closePopup={this.handleClick}
          links={this.props.links}
        />
        <div className="NavigationBar--is-desktop">
          {toRender}
          {contributeButton}
        </div>
      </StyledNav>
    )
  }
}


export default NavigationBar;
