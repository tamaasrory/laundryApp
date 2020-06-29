import React, {memo} from 'react';
import CenterContainer from '../components/CenterContainer';
import Logo from '../components/Logo';
import SInfo from 'react-native-sensitive-info';

const SplashScreen = ({navigation}) => {
  SInfo.getItem('token', {}).then(value => {
    setTimeout(() => {
      if (value) {
        navigation.reset({
          index: 0,
          routes: [{name: 'MainScreen'}],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{name: 'LoginScreen'}],
        });
      }
    }, 1000);
  });

  console.info('#render : ', 'SplashScreen.js');

  return (
    <CenterContainer>
      <Logo />
    </CenterContainer>
  );
};

export default memo(SplashScreen);
