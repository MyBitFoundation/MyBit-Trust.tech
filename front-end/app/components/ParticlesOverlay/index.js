import React from 'react';
import styled from 'styled-components'
import Overlay from './overlay.svg';
import Img from '../Img';

const StyledParticlesOverlay = styled.div`
  position: absolute;
  top: 0px;
  left: 0px;
  z-index: 0;

  & img{
    max-width: 100%;
  }
`

const ParticlesOverlay = () => (
    <StyledParticlesOverlay>
      <Img
        src={Overlay}
        alt="Background overlay"
      />
    </StyledParticlesOverlay>
);

export default ParticlesOverlay;
