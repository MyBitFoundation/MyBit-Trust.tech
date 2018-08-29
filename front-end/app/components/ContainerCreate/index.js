import React from 'react';
import styled from 'styled-components';
import Img from '../Img';
import Button from '../Button';
import Constants from '../Constants';
import AlertMessage from '../Alert';
import CloseButton from './closeButton';

const StyledContainer = styled.section`
  width: 100%;
  height: 100%;
  padding: ${props => props.isConfirmation ? '19px 20px 10px 20px' : '30px 50px'};

  @media (max-width: 360px) {
   padding: 30px 35px;
  }
`;

const StyledContainerWrapper = styled.div`
  width: 326px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  background-color: #ffffff;
  margin: 0 auto;
  position: relative;

  @media (max-width: 360px) {
   width: 280px;
  }

  input{
    margin-bottom: 10px;
  }

  .ant-input-number{
    width: 100%;
    margin-bottom: 10px;
  }
`;

const StyledImage = styled.div`
  margin-bottom: 50px;
  text-align: center;
  img{
    width: 183px;
    height: 183px;
  }
`;

const StyledConfirmButton = styled.div`
  .ant-btn{
    width: 100%;
  }
`;

const StyledAlertMessage = styled.div`
    margin-top: 10px;
    position: absolute;
    width: 100%;
    left: 0px;
    top: 100%;
`;

const StyledHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  position: relative;
`;

const StyledTitle = styled.p`
  font-size: 16px;
  color: rgba(0, 0, 0, 0.85);
  font-weight: 500;
`;

const StyledSeparator = styled.div`
  height: 1px;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.09);
  position: absolute;
  left: 0px;
`;

const StyledConfirmationMessage = styled.p`
  font-size: 16px;
  color: rgba(0, 0, 0, 0.65);
  margin-top: 25px;
  margin-bottom: 25px;
  padding-right: 10px;

  @media (max-width: 360px) {
   padding-right: 0px;
  }
`;

const StyledDetailsContainer = styled.div`
  margin-top: 50px;
  margin-bottom: 60px;
`;

const StyledDetailTitle = styled.p`
  font-size: 16px;
  color: rgba(0, 0, 0, 0.65);
  margin: 0px;
  margin-top: 20px;
`;

const StyledDetailDescription = styled.p`
  font-size: 16px;
  color: rgba(0, 0, 0, 0.65);
  font-weight: 500;
  margin: 0px;
`;

const StyledBackButton = styled.div`
  margin-top: 70px;
`;

const ContainerCreate = (props) => {
  let toRender = [];
  if(props.type === 'input'){
    toRender.push(
      <StyledImage>
        <Img
          src={props.image}
          alt={props.alt}
        />
      </StyledImage>
    )
    toRender.push(props.content);
    toRender.push(
      <StyledConfirmButton>
        <Button
          styling={Constants.buttons.primary.blue}
          handleRoute={props.handleConfirm}
          disabled={!props.acceptedToS}
        >
          Confirm
       </Button>
     </StyledConfirmButton>
    )
  }
  //type == "confirm"
  else{
    toRender.push(
      <div>
        <div>
          <StyledHeader>
            <StyledTitle>
              Transaction Details
            </StyledTitle>
            <CloseButton
              onClick={props.handleClose}
            />
          </StyledHeader>
          <StyledSeparator />
        </div>
        <div>
          <StyledConfirmationMessage>
            Please check the information below and confirm the transaction in MetaMask.
          </StyledConfirmationMessage>
          <StyledSeparator />
        </div>
        <StyledDetailsContainer>
        {props.details.map(info => (
          <div>
          <StyledDetailTitle>
            {info.title}:
          </StyledDetailTitle>
          {
            info.content.map(detail => (
              <StyledDetailDescription>
                {detail}
              </StyledDetailDescription>
            ))
          }
          </div>
        ))}
        </StyledDetailsContainer>
        <StyledSeparator />
        <StyledBackButton>
          <Button
            styling={Constants.buttons.secondary.back}
            handleRoute={props.handleBack}
          >
            Back
           </Button>
         </StyledBackButton>
      </div>
    );
  }

  if(props.alertType){
    toRender.push(
      <StyledAlertMessage>
        <AlertMessage
          type={props.alertType}
          message={props.alertMessage}
          handleAlertClosed={props.handleAlertClosed}
          showIcon
          closable
        />
      </StyledAlertMessage>
    )
  }

  return(
    <StyledContainerWrapper>
      <StyledContainer
        isConfirmation={props.type === 'confirm'}
      >
        {toRender}
      </StyledContainer>
    </StyledContainerWrapper>
  )
}

export default ContainerCreate;
