/*
 * Create New Trust Page
 *
 * Page to create trust contracts
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import ContainerCreate from 'components/ContainerCreate';
import Image from 'components/ContainerCreate/placeholder.png';
import Input from 'components/Input';
import Web3 from '../../utils/core';
import Constants from 'components/Constants';
import Checkbox from 'antd/lib/checkbox';

import 'antd/lib/checkbox/style/css';

const blocksPerSecond = 14;

const StyledTermsAndConditions = styled.s`
  font-size: 12px;
  font-family: 'Roboto';
  margin-bottom: 10px;
  text-decoration: none;

  a{
    color: #1890ff;
  }
`;

const StyledTermsAndConditionsWrapper = styled.div`
  margin-bottom: 10px;
`;

const getSecondsFromBlockNumber = (currentBlock, givenBlock) => {
  if(givenBlock <= currentBlock){
    return 0;
  }
  return Math.round((givenBlock - currentBlock) / blocksPerSecond);
}


export class CreateNewPage extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      shouldConfirm: false,
      isLoading: false,
      acceptedToS: false,
    }
    this.details = [];
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleBack = this.handleBack.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleAlertClosed = this.handleAlertClosed.bind(this);
    this.handleTermsAndConditionsClicked = this.handleTermsAndConditionsClicked.bind(this);
  }

  handleClose(){
    this.setState({
      shouldConfirm: false,
      recepient: '',
      amountEth: '',
      blockNumber: '',
    })
  }

  handleBack(){
    this.setState({shouldConfirm: false})
  }

  async handleConfirm(){
    const { recepient, blockNumber, amountEth } = this.state;
    const { currentBlock } = this.props;
    this.setState({alertType: undefined})

    let alertType = undefined;
    let alertMessage = undefined;

    if(!Web3.utils.isAddress(recepient)){
      alertMessage = "Please enter a valid Ethereum address.";
    }
    else if(blockNumber > 1000){
      alertMessage = "Block number is to far into the future. Please try a smaller number.";
    }
    else if(!amountEth || amountEth == 0){
      alertMessage = "Amount of ETH needs to be higher than zero.";
    }

    if(alertMessage){
      alertType = 'error';
      this.setState({
        alertType,
        alertMessage
      })
      return;
    }

    //generate details
    this.details = [];
    this.details.push({
      title: 'Recipient',
      content: [Constants.functions.shortenAddress(recepient) + "."]
    }, {
      title: 'Amount',
      content: [amountEth + " ETH"]
    }, {
      title: 'Deliver on Block Number',
      content: [blockNumber + currentBlock]
    })

    this.setState({shouldConfirm: true})
    this.setState({ alertType: 'info', alertMessage: "Waiting for confirmations." });

    try {
      const result = await this.props.createTrust(
        recepient,
        amountEth,
        false,
        getSecondsFromBlockNumber(currentBlock, currentBlock + blockNumber)
      );
      if (result) {
        this.setState({ alertType: 'success', alertMessage: "Transaction confirmed." });
      } else {
        this.setState({ alertType: 'error',  alertMessage: "Transaction failed. Please try again with more gas." });
      }
      this.props.getTransactions();
    } catch (err) {
      this.setState({ alertType: undefined});
    }
  }

  handleTermsAndConditionsClicked(e){
    this.setState({acceptedToS: e.target.checked});
  }

  handleAlertClosed(){
    this.setState({alertType: undefined})
  }

  handleInputChange(text, id){
    this.setState({
      [id]: text,
    })
  }

  render() {
    let toRender = [];

    const content = (
      <div >
        <Input
          placeholder="Recipient"
          value={this.state.recepient}
          onChange={(e) => this.handleInputChange(e.target.value, 'recepient')}
          tooltipTitle="Who will recieve your funds on execution?"
          hasTooltip
        />
        <Input
          placeholder="Amount ETH"
          type="number"
          value={this.state.amountEth}
          onChange={(number) => this.handleInputChange(number, 'amountEth')}
          min={0}
        />
        <Input
          placeholder="Send payment in #blocks"
          type="number"
          value={this.state.blockNumber}
          onChange={(number) => this.handleInputChange(number, 'blockNumber')}
          tooltipTitle="How many blocks until payment is sent? 250 is roughly 1 hour."
          hasTooltip
          min={10}
        />
        <StyledTermsAndConditionsWrapper>
          <Checkbox
            onChange={this.handleTermsAndConditionsClicked}
          >
          <StyledTermsAndConditions>
            I agree to the <a href="#">Terms and Conditions</a>.
          </StyledTermsAndConditions>
          </Checkbox>
        </StyledTermsAndConditionsWrapper>
      </div>
    )

    if(this.state.shouldConfirm){
      toRender.push(
        <ContainerCreate
          type="confirm"
          handleClose={this.handleClose}
          handleBack={this.handleBack}
          alertType={this.state.alertType}
          alertMessage={this.state.alertMessage}
          handleAlertClosed={this.handleAlertClosed}
          details={this.details}
        />
      )
    }
    else{
      toRender.push(
        <ContainerCreate
          type="input"
          image={Image}
          alt="Placeholder image"
          content={content}
          handleConfirm={this.handleConfirm}
          alertType={this.state.alertType}
          alertMessage={this.state.alertMessage}
          handleAlertClosed={this.handleAlertClosed}
          acceptedToS={this.state.acceptedToS}
        />
      )
    }

    return (
      <article>
        <Helmet>
          <title>Create Transaction</title>
          <meta
            name="Create transaction"
            content="Create a transaction to take place on a given block on the MyBit Trust dApp"
          />
        </Helmet>
        {toRender}
      </article>
    );
  }
}

CreateNewPage.propTypes = {
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  repos: PropTypes.oneOfType([PropTypes.array, PropTypes.bool]),
  onSubmitForm: PropTypes.func,
  username: PropTypes.string,
  onChangeUsername: PropTypes.func,
};

export default CreateNewPage;
