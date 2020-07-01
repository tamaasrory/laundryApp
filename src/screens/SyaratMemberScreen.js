import React from 'react';
import FlatContainer from '../components/FlatContainer';
import {Button, Text} from 'react-native-elements';
import styles from '../components/Styles';
import {StatusBar, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

class SyaratMemberScreen extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={{backgroundColor: '#fff', flexGrow: 1}}>
        <StatusBar backgroundColor={'#ed9100'} barStyle={'light-content'} />
        <View
          style={{
            flexDirection: 'row',
            paddingVertical: 8,
            elevation: 4,
            backgroundColor: '#ff9e00',
          }}>
          <Button
            type={'clear'}
            onPress={() => this.props.navigation.goBack()}
            containerStyle={{justifyContent: 'center'}}
            icon={
              <MaterialCommunityIcons
                name={'arrow-left'}
                size={28}
                color={'white'}
              />
            }
          />
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
              paddingHorizontal: 15,
            }}>
            <Text style={[styles.textHeader, {color: '#fff'}]}>
              Persyaratan
            </Text>
            <Text
              style={[styles.textSecondary, {color: '#fff', marginTop: -3}]}>
              Menjadi Member
            </Text>
          </View>
        </View>

        <View style={{flex: 1, height: 100}}>
          <FlatContainer style={{paddingHorizontal: 25, paddingTop: 10}}>
            <Text style={[styles.textSecondary, {marginVertical: 10}]}>
              Berikut adalah persyaratan menjadi member Ethan Laundry:
            </Text>
          </FlatContainer>
        </View>
      </View>
    );
  }
}

export default SyaratMemberScreen;
