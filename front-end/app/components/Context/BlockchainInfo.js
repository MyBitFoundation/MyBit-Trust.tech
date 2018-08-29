import React from 'react';
import PropTypes from 'prop-types';
import BlockchainInfoContext from './BlockchainInfoContext';
import * as Core from '../../utils/core';
import Web3 from '../../utils/core';

class BlockchainInfo extends React.Component {
  constructor(props) {
    super(props);

    this.loadMetamaskUserDetails = this.loadMetamaskUserDetails.bind(this);
    this.createTrust = this.createTrust.bind(this);
    this.getCurrentBlockNumber = this.getCurrentBlockNumber.bind(this);
    this.getTransactions = this.getTransactions.bind(this);
    this.withdraw = this.withdraw.bind(this);

    this.state = {
      loading: {
        user: true,
        transactionHistory: true,
      },
      sentTransactions: [],
      receivedTransactions: [],
      user: {},
      createTrust: this.createTrust,
      currentBlock: 0,
      getTransactions: this.getTransactions,
      withdraw: this.withdraw
    };
  }

  async componentWillMount() {
    try {
      // we need the prices and the user details before doing anything
      await Promise.all([this.loadMetamaskUserDetails(), this.getCurrentBlockNumber()]);
      await this.getTransactions();
      setInterval(this.getTransactions, 10000);
    } catch (err) {
    }
  }

  async getCurrentBlockNumber(){
    const currentBlock = await Web3.eth.getBlockNumber();
    this.setState({currentBlock})
  }

  createTrust(to, amount, revokable, deadline) {
    return Core.createTrust(this.state.user.userName, to, amount, revokable, deadline);
  }

  withdraw(contractAddress) {
    return Core.withdraw(contractAddress, this.state.user.userName);
  }

  async getTransactions(){
    await Core.getTrustLog()
      .then( async (response) => {
        const userAddress = this.state.user.userName;
        const receivedTransactionsTmp = [];
        const sentTransactions = [];

    try{
      response.forEach(transaction => {
        if(transaction.returnValues._beneficiary === userAddress){
          receivedTransactionsTmp.push({
            contractAddress: transaction.returnValues._trustAddress,
            trustor: transaction.returnValues._trustor,
            amount: web3.utils.fromWei(transaction.returnValues._amount.toString(), 'ether'),
            transactionHash: transaction.transactionHash,
          })
        }
        else if(transaction.returnValues._trustor === userAddress){
          sentTransactions.push({
            beneficiary: transaction.returnValues._beneficiary,
            amount: web3.utils.fromWei(transaction.returnValues._amount.toString(), 'ether'),
            transactionHash: transaction.transactionHash
          })
        }
      })
     }catch(err){
      console.log(err)
     }

      let receivedTransactions = [];
      if(receivedTransactionsTmp.length !== 0){
        const withdrawableByTime =  await Promise.all(receivedTransactionsTmp.map(async transaction =>
        Core.isWithdrawable(transaction.contractAddress)));

        receivedTransactions = await Promise.all(receivedTransactionsTmp.map( async (transaction, index) => {
            const withdrawals = await Core.getWithdrawlsLog(transaction.contractAddress);
            const deposits = await Core.getDepositsLog(transaction.contractAddress);
            let canWithdraw = true;

            //block number of last withdrawal event is higher than block number of last deposit event
            //means there is nothing to withdraw
           if(withdrawals.length > 0 && withdrawals[withdrawals.length-1].blockNumber > deposits[deposits.length - 1].blockNumber){
              canWithdraw = false;
            }

            return{
              ...transaction,
              withdrawable: canWithdraw,
              pastDate: withdrawableByTime[index],
            }
          }))

      }

      this.setState({
        sentTransactions,
        receivedTransactions,
        loading: {
          ...this.state.loading,
          transactionHistory: false,
        }
      })

      })
      .catch((err) => {
        console.log(err);
      });
  }

  async loadMetamaskUserDetails() {
    await Core.loadMetamaskUserDetails()
      .then((response) => {
        this.setState({
          user: response,
          loading: { ...this.state.loading, user: false },
        });
      })
      .catch((err) => {
        setTimeout(this.loadMetamaskUserDetails, 10000);
      });
  }

  render() {
    return (
      <BlockchainInfoContext.Provider value={this.state}>
        {this.props.children}
      </BlockchainInfoContext.Provider>
    );
  }
}

export default BlockchainInfo;

BlockchainInfo.propTypes = {
  children: PropTypes.node.isRequired,
};
