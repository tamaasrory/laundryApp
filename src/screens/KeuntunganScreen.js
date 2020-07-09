import React from 'react';
import {Button, Text} from 'react-native-elements';
import styles from '../components/Styles';
import {StatusBar, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import WebView from 'react-native-webview';
import Path from '../router/Path';

class KeuntunganScreen extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={{backgroundColor: '#fff', flexGrow: 1}}>
        <StatusBar backgroundColor={'#009228'} barStyle={'light-content'} />
        <View
          style={{
            flexDirection: 'row',
            paddingVertical: 8,
            elevation: 4,
            backgroundColor: '#00a62a',
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
            <Text style={[styles.textHeader, {color: '#fff'}]}>Keuntungan</Text>
            <Text
              style={[styles.textSecondary, {color: '#fff', marginTop: -3}]}>
              Menjadi Member
            </Text>
          </View>
        </View>

        <View style={{flex: 1, height: 100}}>
          <WebView
            source={{uri: `${Path.baseUrl}/api/v1/keuntungan-menjadi-member`}}
          />
        </View>
      </View>
    );
  }
}

export default KeuntunganScreen;
