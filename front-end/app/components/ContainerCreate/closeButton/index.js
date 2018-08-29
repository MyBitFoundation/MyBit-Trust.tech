import React from 'react';
import styled from 'styled-components';

const StyledA = styled.a`
  font-size: 12px;
  position: absolute;
  right: 5px;
  top: 5px;
  line-height: 22px;
  overflow: hidden;
  cursor: pointer;

  .close-icon{
    color: rgba(0, 0, 0, 0.45);
    transition: color .3s;
    font-style: normal;
    vertical-align: baseline;
    text-align: center;
    line-height: 1;
    text-rendering: optimizeLegibility;

    &:before{
      content: "\\E633";
      display: block;
      font-family: "anticon" !important;
    }
  }
`;

const closeButton = ({onClick}) => (
  <StyledA onClick={onClick}>
    <i className="close-icon"/>
  </StyledA>
);

export default closeButton;
