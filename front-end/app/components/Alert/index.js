import React from 'react';
import styled from 'styled-components';
import Alert from 'antd/lib/alert';
import 'antd/lib/alert/style/css';

const StyledAlert = styled.div`
  .ant-alert{
    width: 100%;
    padding: 8px 35px 8px 37px;
  }
`;

const AlertMessage = (props) => (
  <StyledAlert>
      <Alert
        type={props.type}
        message={props.message}
        onClose={props.handleAlertClosed}
        showIcon
        closable

      />
  </StyledAlert>
)

export default AlertMessage;
