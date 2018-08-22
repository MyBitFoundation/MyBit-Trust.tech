import React from 'react';
import Constants from '../Constants';
import styled from 'styled-components'

const StyledAppWrapper = styled.div`
  background: ${Constants.colors.backgroundGradient}
  margin: 0 auto;
  display: flex;
  height: 100%;
  padding: 0 16px;
  flex-direction: column;
  color: white;
  min-height: 100vh;
`;

const AppWrapper = ({ children, logo }) => (
	<StyledAppWrapper>
    {children}
  </StyledAppWrapper>
)

export default AppWrapper;
