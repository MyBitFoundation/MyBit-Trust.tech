/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

import H1 from 'components/H1';
import P from 'components/P';
import Button from 'components/Button';
import Constants from 'components/Constants';
import ReposList from 'components/ReposList';
import AtPrefix from './AtPrefix';
import CenteredSection from './CenteredSection';
import Form from './Form';
import Input from './Input';
import Section from './Section';
import messages from './messages';

const StyledMetamaskLink = styled.a`
  color: #ffffff;
  text-decoration: underline;

  &:hover{
    color: #ffffff;
    text-decoration: underline;
  }
`;

const StyledParagraphGroupText = styled.div`
  margin-top: 30px;
`;

const StyledCreateNewButton = styled.div`
  margin-top: 50px;
`;

const StyledMakeDappAwesome = styled.div`
  margin-top: 120px;
`;

const StyledCenterButton = styled.div`
  margin: 0 auto;
  width: max-content;
`;

const StyledPage = styled.article`
  text-align: center;
`;

export class HomePage extends React.PureComponent {
  render() {
    return (
      <StyledPage>
        <Helmet>
          <title>Home Page</title>
          <meta
            name="Home page"
            content="Create a transactions on the MyBit Trust dApp"
          />
        </Helmet>
        <H1>
          A trust fund on the blockchain.
        </H1>
        <H1>
          Distribute crypto funds without the middleman.
        </H1>
        <StyledParagraphGroupText>
          <P
            fontSize={Constants.paragraphs.homePage.fontSize}
            textAlign={Constants.paragraphs.homePage.textAlign}
            text="Welcome to MyBit Trust, a dApp that makes it easy to create and manage trust funds on the blockchain. Without lawyers, brokers or third party fees."
          />
          <P
            fontSize={Constants.paragraphs.homePage.fontSize}
            textAlign={Constants.paragraphs.homePage.textAlign}
          >
            It works like this. With <StyledMetamaskLink href="https://metamask.io/" target="_blank" rel="noopener noreferrer">MetaMask</StyledMetamaskLink> enabled, start by choosing a recipient and selecting the amount and when you’d like them to receive their fund. Once set up, your crypto assets are held in trust and only available to the recipient - all secured on the blockchain. MyBit Trust works exactly like a regular trust, just without the time expense of a lawyer or third parties. Each trust will have a one-time fee of MYB250, which will then be burnt.
          </P>
          <P
            fontSize={Constants.paragraphs.homePage.fontSize}
            textAlign={Constants.paragraphs.homePage.textAlign}
            text="And please note, while this application is now live - it’s still under development.  "
          />
        </StyledParagraphGroupText>
        <StyledCenterButton>
          <StyledCreateNewButton>
            <Button
              styling={Constants.buttons.primary.green}
              linkTo="/create-new"
              size="large"
            >
              Start your fund
             </Button>
           </StyledCreateNewButton>
         </StyledCenterButton>
         <StyledMakeDappAwesome>
           <P
              fontSize={Constants.paragraphs.homePage.fontSize}
              textAlign={Constants.paragraphs.homePage.textAlign}
              text="Make this dApp awesome here:"
            />
          </StyledMakeDappAwesome>
          <StyledCenterButton>
            <Button
              styling={Constants.buttons.secondary.default}
              href="https://mybit.io"
            >
              Contribute
             </Button>
          </StyledCenterButton>
        {/*<div>
          <CenteredSection>
            <H2>
              <FormattedMessage {...messages.startProjectHeader} />
            </H2>
            <p>
              <FormattedMessage {...messages.startProjectMessage} />
            </p>
          </CenteredSection>
          <Section>
            <H2>
              <FormattedMessage {...messages.trymeHeader} />
            </H2>
            <Form onSubmit={this.props.onSubmitForm}>
              <label htmlFor="username">
                <FormattedMessage {...messages.trymeMessage} />
                <AtPrefix>
                  <FormattedMessage {...messages.trymeAtPrefix} />
                </AtPrefix>
                <Input
                  id="username"
                  type="text"
                  placeholder="mxstbr"
                  value={this.props.username}
                  onChange={this.props.onChangeUsername}
                />
              </label>
            </Form>
            <ReposList {...reposListProps} />
          </Section>
        </div>*/}
      </StyledPage>
    );
  }
}

HomePage.propTypes = {
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  repos: PropTypes.oneOfType([PropTypes.array, PropTypes.bool]),
  onSubmitForm: PropTypes.func,
  username: PropTypes.string,
  onChangeUsername: PropTypes.func,
};

export default HomePage;
