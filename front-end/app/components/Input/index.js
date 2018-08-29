import React from 'react';
import styled from 'styled-components';
import { default as InputAnt} from 'antd/lib/input';
import { default as InputNumberAnt} from 'antd/lib/input-number';

import 'antd/lib/input/style/css';
import 'antd/lib/input-number/style/css';
import Img from '../Img';
import QuestionMark from './questionMark.svg';
import Tooltip from '../Tooltip';

const StyledInput = styled.div`
  position: relative;
`;

const StyledImage = styled.div`
  position: absolute;
  left: 100%;
  margin-left: 9px;
  top: 4px;

  img{
    width: 16px;
  }
`;

const Input = (props) => {
  let toRender = [];
  if(props.hasTooltip){
    toRender.push(
      <Tooltip
        title={props.tooltipTitle}
        arrowPointAtCenter={true}
        placement="topLeft"
      >
        <StyledImage>
          <Img
            src={QuestionMark}
            alt="Hover for information"
          />
        </StyledImage>
      </Tooltip>
    );
  }

  if(props.type === "number"){
    toRender.push(
      <InputNumberAnt
        placeholder={props.placeholder}
        size={props.size}
        value={props.value}
        onChange={props.onChange}
        onPressEnter={props.onEnterPressed}
        min={props.min}
      />
    )

  }
  else{
    toRender.push(
      <InputAnt
        placeholder={props.placeholder}
        size={props.size}
        value={props.value}
        onChange={props.onChange}
        onPressEnter={props.onEnterPressed}
      />
    )
  }

  return (
    <StyledInput>
        {toRender}
    </StyledInput>
  )
}
export default Input;
