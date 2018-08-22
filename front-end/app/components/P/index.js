/**
 * A paragraph
 */
import React from 'react';
import styled from 'styled-components';

const StyledParagraph = styled.p`
  font-size: ${props => props.styling.fontSize};
  text-align: ${props => props.styling.textAlign};
`;

const P = (props) => (
  <StyledParagraph styling={props}>
    {props.text || props.children}
  </StyledParagraph>
)

export default P;
