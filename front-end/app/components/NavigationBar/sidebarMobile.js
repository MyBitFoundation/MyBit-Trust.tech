import React from 'react';
import styled from 'styled-components';
import classNames from 'classnames'
import MobileBackground from './mobile-bg.svg';
import socialIcons from './socialIcons';
import Discord from './socialIcons/discord.svg';
import DiscordHover from './socialIcons/discord-hover.svg';

const StyledNav = styled.div`
  .SidebarMobile {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: transparent;
    z-index: 10000;
    height: 0px;
    visibility: visible;
    opacity: 1;
    transition: height 0.35s ease-in 200ms;

    &:before{
      position: absolute;
      content: ' ';
      right: 0;
      left: 0;
      width: 105%;
      margin: 0 auto;
      height: 0px;
      background-size: cover;
      background: url(${MobileBackground});
      background-position: center;
      background-repeat: no-repeat;
      background-size: cover;
      top: 0px;
      visibility: visible;
      opacity: 1;
      transition: height 0.35s ease-in 200ms;
    }

    &--is-visible{
      height: 100vh;

      &:before{
        height: 101vh;
      }

      & .IconList{
        transform: scale(1) translateY(50px) !important;
        opacity: 1 !important;
        transition-delay: 400ms !important;
        visibility: visible !important;
      }
    }

    &__overlay-btn-close {
      position: absolute;
      top: 20px;
      right: 30px;
      font-size: 50px;
      font-weight: bold;
      text-decoration: none;
      color: #fff;
      cursor: pointer;
      z-index: 2;
      opacity: 0;
      transform: rotate(-90deg) scale(0.5);
      transition: transform 0.25s linear 200ms, opacity 0.25s linear 200ms, visibility 0.25s linear 200ms !important;
      visibility: hidden;

      &--is-visible{
        visibility: visible;
        opacity: 1;
        transform: rotate(0deg) scale(1);
      }
    }

    &__overlay-link{
      text-decoration: none;
      color: inherit;
      position: relative;
      font-family: 'Roboto';
      font-size: 23px;
      color: #ffffff;
      display: block;
      width: max-content;
      margin-bottom: 18px;
      transition: opacity 0.35s ease-out, transform 0.35s ease-out, visibility 0.35s ease-out;;
      transform: scale(1.5) translateY(-30px);
      opacity: 0;
      visibility: hidden;
      margin-left: 30px;

      &:nth-child(2){
        transition-delay: 250ms;
        margin-top: 50px;
      }

      &:nth-child(3){
        transition-delay: 200ms;
      }

      &:nth-child(4){
        transition-delay: 150ms;
      }

      &:nth-child(5){
        transition-delay: 100ms;
      }

      &:nth-child(6){
        transition-delay: 50ms;
      }

      &--is-visible{
        transform: scale(1) translateY(50px);
        opacity: 1;
        visibility: visible;
      }

      &--is-visible:nth-child(2){
        transition-delay: 450ms;
      }

      &--is-visible:nth-child(3){
        transition-delay: 500ms;
      }

      &--is-visible:nth-child(4){
        transition-delay: 550ms;
      }

      &--is-visible:nth-child(5){
        transition-delay: 600ms;
      }

      &--is-visible:nth-child(6){
        transition-delay: 650ms;
      }
    }

    &__overlay-link:hover{
      color: #ffffff;
    }

    &__overlay-link:after {
      content: "";
      position: absolute;
      width: 100%;
      height: 2px;
      bottom: -3px;
      left: 0;
      background-color: white;
      visibility: hidden;
      transform: scaleX(0);
      transition: all 0.3s ease-in-out 0s;
    }

    &__overlay-link:hover:after {
      visibility: visible;
      transform: scaleX(1);
    }
  }
`;

const StyledIconList = styled.div`
  .IconList{
    position: fixed;
    top: 85vh;
    left: 0px;
    width: 90%;
    margin-left: 5%;
    transition: opacity 0.35s ease-out, transform 0.35s ease-out, visibility 0.35s ease-out;
    transform: scale(1.2) translateY(-180px);
    opacity: 0;
    transition-delay: 200ms;
    visibility: hidden;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    width: 90%;
    margin: 0 auto;

    .socialIcon__wrapper{
      width: 35px;
      height: 35px;

      &:before {
        content: '';
        display: block;
        margin: 0 auto;
        width: 75px;
        height: 75px;
        transition: background 180ms;
        cursor: pointer;
      }
    }

    .socialIcon{
      margin: 0 20px;
    }
  }
`;

/*
    .socialIcon--is-discord {
      background: url(${Discord});
    }
    .socialIcon--is-discord:hover {
      background: url(${DiscordHover});
    }
*/

const SidebarMobile = ({links, open, closePopup}) => {

  //we need to add another link (contribute)
  let mobileLinks = links.slice();

  mobileLinks.push({
    text: 'Start your fund',
    linkTo: '/create-new',
  }, {
    text: 'Contribute',
    linkTo: 'https://mybit.io',
    external: true
  })

  const linksToRender = mobileLinks.map((link) => {
      return(
        <a
          key={link.linkTo}
          href={link.linkTo}
          className={
          classNames({
            'SidebarMobile__overlay-link': true,
            'SidebarMobile__overlay-link--is-visible' : open
          })
        }

          target={link.external ? "_blank" : ""}
          rel="noopener noreferrer"
        >
          {link.text}
        </a>
      )
    })

  const socialToRender = (
    <StyledIconList>
      <div className="IconList">
      {
        socialIcons.map(icon => {
          return (
            <a
              key={icon.name}
              href={icon.href}
              target="_blank"
              rel='noopener noreferrer'
            >
              <div className="socialIcon">
                <div className={`socialIcon__wrapper socialIcon--is-${icon.name}`} />
              </div>
            </a>
          )})
      }
      </div>
    </StyledIconList>
  )

  return(
    <StyledNav>
      <div className={
          classNames({
            'SidebarMobile': true,
            'SidebarMobile--is-visible' : open,
          })
        }
      >
          <a
            className={
              classNames({
                'SidebarMobile__overlay-btn-close': true,
                'SidebarMobile__overlay-btn-close--is-visible' : open,
              })
            }
            onClick={() => closePopup(false)}
          >
            &times;
          </a>
        {linksToRender}
        {socialToRender}
      </div>
    </StyledNav>
  )
}

export default SidebarMobile;
