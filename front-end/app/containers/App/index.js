/**
 *
 * App
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */

import React from 'react';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import { Switch, Route } from 'react-router-dom';

import HomePage from 'containers/HomePage/Loadable';
import CreateNewPage from 'containers/CreateNewPage/Loadable';
import RedeemPage from 'containers/RedeemPage/Loadable';
import TransactionsPage from 'containers/TransactionsPage/Loadable';
import NotFoundPage from 'containers/NotFoundPage/Loadable';
import Header from 'components/Header';
import Footer from 'components/Footer';
import AppWrapper from 'components/AppWrapper';
import MyBitTrustLogo from 'components/MyBitTrustLogo';
import PageWrapper from 'components/PageWrapper';
import Button from 'components/Button';
import Constants from 'components/Constants';
import NavigationBar from 'components/NavigationBar';
import BlockchainInfoContext from 'components/Context/BlockchainInfoContext';

export default function App(props) {
  const navigationLinks = [
    {
      text: 'How it works',
      linkTo: '/'
    },{
      text: 'Transactions',
      linkTo: '/transactions',
    },{
      text: 'Redeem',
      linkTo: '/redeem'
    }
  ];

  return (
    <AppWrapper>
      <Helmet
        titleTemplate="%s - MyBit Trust"
        defaultTitle="MyBit"
      >
        <meta name="description" content="Schedule a transaction in the ethereum network" />
      </Helmet>
      <Header
        logo={MyBitTrustLogo}
      />
      <PageWrapper>
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route path="/transactions" component={() =>
            <BlockchainInfoContext.Consumer>
              {({ sentTransactions, loading }) =>  (
                  <TransactionsPage sentTransactions={sentTransactions} loading={loading.transactionHistory}/>
                )
              }
            </BlockchainInfoContext.Consumer>
          }
          />
          <Route path="/create-new" component={() =>
            <BlockchainInfoContext.Consumer>
              {({ createTrust, currentBlock, getTransactions }) =>  (
                  <CreateNewPage createTrust={createTrust} currentBlock={currentBlock} getTransactions={getTransactions}/>
                )
              }
            </BlockchainInfoContext.Consumer>
          }
          />
          <Route path="/redeem" component={() =>
            <BlockchainInfoContext.Consumer>
              {({ receivedTransactions, loading, withdraw, getTransactions }) =>  (
                  <RedeemPage receivedTransactions={receivedTransactions} loading={loading.transactionHistory} withdraw={withdraw} getTransactions={getTransactions}/>
                )
              }
            </BlockchainInfoContext.Consumer>
          }

          />
        </Switch>
      </PageWrapper>
      <Footer />
    </AppWrapper>
  );
}
