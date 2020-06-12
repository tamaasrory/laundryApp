/**
 * @flow strict-local
 */
import React from 'react';
import CenterContainer from '../components/CenterContainer';
import Logo from '../components/Logo';
import Paragraph from '../components/Paragraph';
import {Text, Button} from 'react-native-elements';
import styles from '../components/Styles';

class HomeScreen extends React.PureComponent {
  input = null;
  constructor(props) {
    super(props);
  }

  render() {
    console.info('#render : ', this.constructor.name);
    return (
      <CenterContainer>
        <Logo />
        <Text style={styles.textHeader}>Selamat Datang</Text>
        <Paragraph>
          Nikmati kemudahan mencuci dalam genggaman. Yuk order laundry sekarang!
        </Paragraph>
        <Button
          type={'outline'}
          title={'Order Sekarang'}
          buttonStyle={{paddingHorizontal: 20}}
          onPress={() => console.log(this.props.navigation.navigate('Order'))}
        />
      </CenterContainer>
    );
  }
}

export default HomeScreen;
