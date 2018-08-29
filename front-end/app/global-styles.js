import { injectGlobal } from 'styled-components';
import Gilroy from './fonts/gilroy-extrabold.otf';

/* eslint no-unused-expressions: 0 */
injectGlobal`

  @font-face {
      font-family: 'Gilroy';
      src: url('${Gilroy}') format('opentype');
      font-weight: bold;
  }

  html,
  body {
    height: 100%;
    width: 100%;
    object-fit: contain;
  }

  body {
    font-family: 'Roboto', sans-serif;
    -moz-font-feature-settings: 'kern';
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body.fontLoaded {
    font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }

  #app {
    min-height: 100%;
    min-width: 100%;
  }

  p,
  label {
    font-family: Roboto, Times, 'Times New Roman', serif;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: normal;
    letter-spacing: normal;
  }

  [class^="ant-"]{
    font-family: 'Roboto', sans-serif;
  }
`;
