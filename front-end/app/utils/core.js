import dayjs from 'dayjs';
import getWeb3Async from './web3';
import * as TrustFactory from '../constants/contracts/TrustFactory';
import * as Trust from '../constants/contracts/Trust';
import { ETHERSCAN_TX } from '../constants';
import axios from 'axios';
const Web3 = getWeb3Async();

export const loadMetamaskUserDetails = async () =>
  new Promise(async (resolve, reject) => {
    try {
      const accounts = await Web3.eth.getAccounts();
      const balance = await Web3.eth.getBalance(accounts[0]);
      const details = {
        userName: accounts[0],
        ethBalance: Web3.utils.fromWei(balance, 'ether')
      };
      resolve(details);
    } catch (error) {
      reject(error);
    }
  });


export const getTrustLog = async () =>

  new Promise(async (resolve, reject) => {
    try {

      const trustContract = new Web3.eth.Contract(
        TrustFactory.ABI,
        TrustFactory.ADDRESS,
      );

      const logTransactions = await trustContract.getPastEvents(
        'LogNewTrust',
        { fromBlock: 0, toBlock: 'latest' },
      );

      resolve(logTransactions);
    } catch (error) {
      reject(error);
    }
  });

export const getWithdrawlsLog = async (contractAddress) =>
  new Promise(async (resolve, reject) => {
    try {

      const trustContract = new Web3.eth.Contract(
        Trust.ABI,
        contractAddress,
      );

      const logWithdawls = await trustContract.getPastEvents(
        'LogWithdraw',
        { fromBlock: 0, toBlock: 'latest' },
      );

      resolve(logWithdawls);
    } catch (error) {
      reject(error);
    }
  });

  export const getDepositsLog = async (contractAddress) =>
    new Promise(async (resolve, reject) => {
      try {

        const trustContract = new Web3.eth.Contract(
          Trust.ABI,
          contractAddress,
        );

        const logDeposits = await trustContract.getPastEvents(
          'LogDeposit',
          { fromBlock: 0, toBlock: 'latest' },
        );

        resolve(logDeposits);
      } catch (error) {
        reject(error);
      }
    });

export const createTrust = async (from, to, amount, revokable, deadline) =>
  new Promise(async (resolve, reject) => {
    try {
      const trustContract = new Web3.eth.Contract(
        TrustFactory.ABI,
        TrustFactory.ADDRESS,
      );
      const weiAmount = Web3.utils.toWei(amount.toString(), 'ether');
      const trustResponse = await trustContract.methods
        .deployTrust(to, revokable, deadline)
        .send({
          value: weiAmount,
          from: from,
        });

      const { transactionHash } = trustResponse;

      checkTransactionStatus(transactionHash, resolve, reject);
    } catch (error) {
      reject(error);
    }
  });

//createTrust('0x11cf613d319dc923f3248175e0271588f1b26991', '0xdf610206bf6e1ba3c879a202f4bc7e8986452174', 0.1, false, 30);

export const isWithdrawable = async (contractAddress) =>
  new Promise(async (resolve, reject) => {
    try {

      const trustContract = new Web3.eth.Contract(
        Trust.ABI,
        contractAddress,
      );

      const secondsUntilDeadline = await trustContract.methods.blocksUntilExpiration().call();
      resolve(secondsUntilDeadline === '0');
    } catch (error) {
      reject(error);
    }
  });

export const withdraw = async (contractAddress, user) =>
  new Promise(async (resolve, reject) => {
    try {

      const trustContract = new Web3.eth.Contract(
        Trust.ABI,
        contractAddress,
      );

      const withdrawResponse = await trustContract.methods.withdraw()
        .send({ from: user });

      const { transactionHash } = withdrawResponse;

      checkTransactionStatus(transactionHash, resolve, reject);
    } catch (error) {
      reject(error);
    }
  });

const checkTransactionStatus = async (
  transactionHash,
  resolve,
  reject,
) => {
  try {
    const endpoint = ETHERSCAN_TX(transactionHash);
    const result = await fetch(endpoint);
    const jsronResult = await result.json();
    if (jsronResult.status === '1') {
      checkTransactionConfirmation(transactionHash, resolve, reject);
    } else if (jsronResult.status === '0') {
      resolve(false);
    } else {
      setTimeout(
        () => checkTransactionStatus(transactionHash, resolve, reject),
        1000,
      );
    }
  } catch (err) {
    reject(err);
  }
};

const checkTransactionConfirmation = async (
  transactionHash,
  resolve,
  reject,
  ) => {
  try{
    const response = await axios.get(`https://ropsten.etherscan.io/tx/${transactionHash}`);
    var myRe = new RegExp('(<font color=\'green\'>Success</font>)', 'g');
    var r = myRe.exec(response.data);
    if(r.length > 0){
      resolve(true);
    }

    myRe = new RegExp('(<font color=\'red\'>Fail</font>)', 'g');
    r = myRe.exec(response.data);
    if(r.length > 0){
      resolve(false);
    }
    else{
      setTimeout(
        () => checkTransactionConfirmation(transactionHash, resolve, reject),
        1000,
      );
    }
  }catch(err){
    setTimeout(
      () => checkTransactionConfirmation(transactionHash, resolve, reject),
      1000,
    );
  }
}

export default Web3;
