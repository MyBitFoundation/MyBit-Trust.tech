const blue = '#1890ff';
const blueHover = '#40a9ff';
const blueActive = '#096dd9';
const green = '#00F281';
const greenHover = '#55EAA5';
const greenActive = '#00C368';

const Constants = {
  colors: {
    backgroundGradient: 'linear-gradient(62deg, #001358, #125ac4);',
  },
  buttons:{
    primary:{
      green: {
        color: 'white',
        colorHover: 'white',
        colorActive: '',
        backgroundColor: green,
        backgroundColorHover: greenHover,
        backgroundColorActive: greenActive,
        borderColor: green,
        borderColorHover: greenHover,
        borderColorActive: greenActive,
      },
      blue: {
        color: 'white',
        colorHover: 'white',
        colorActive: 'white',
        backgroundColor: blue,
        backgroundColorHover: blueHover,
        backgroundColorActive: blueActive,
        borderColor: blue,
        borderColorHover: blueHover,
        borderColorActive: blueActive,
      }
    },
    secondary: {
      default: {
        color: 'white',
        colorHover: blueHover,
        colorActive: blueActive,
        backgroundColor: 'transparent',
        backgroundColorHover: 'transparent',
        backgroundColorActive: 'transparent',
        borderColor: 'white',
        borderColorHover: blueHover,
        borderColorActive: blueActive,
      },
      back: {
        color: 'rgba(0, 0, 0, 0.65)',
        colorHover: blueHover,
        colorActive: blueActive,
        backgroundColor: 'transparent',
        backgroundColorHover: 'transparent',
        backgroundColorActive: '#ffffff',
        borderColor: '#d9d9d9',
        borderColorHover: blueHover,
        borderColorActive: blueActive,
      }
    }
  },
  paragraphs:{
    homePage:{
      fontSize: '20px',
      textAlign: 'center',
    }
  },
  createNewContainer:{
    maxWidth: '326px',
  },
  functions: {
    shortenAddress: (address, leftSide=15, rightSide=8) => {
      const size = address.length;
      let splitAddress = [address.slice(0, leftSide), address.slice(size - rightSide, size)]
      return splitAddress[0] + "..." + splitAddress[1];
    }
  }
}

export default Constants;
