import React from 'react';
import styled, { injectGlobal } from 'styled-components';
import {default as TooltipAnt} from 'antd/lib/tooltip';
import 'antd/lib/tooltip/style/css';

injectGlobal`
  .ant-tooltip {
    .ant-tooltip-inner{
      background-color: #ffffff;
      color: rgba(0, 0, 0, 0.65);
      font-size: 14px;
    }

    .ant-tooltip-arrow{
      border-top-color: #ffffff !important;
      border-bottom-color: #ffffff !important;
    }

    .ant-tooltip-inner{
      word-break: break-word !important;
    }
  }
`;

const Tooltip = ({children, title, arrowPointAtCenter, placement}) => (
  <TooltipAnt
    title={title}
    arrowPointAtCenter={arrowPointAtCenter}
    placement={placement}
  >
    {children}
  </TooltipAnt>
)

export default Tooltip;
