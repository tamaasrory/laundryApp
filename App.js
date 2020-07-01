/**
 * React Native [Laundry App]
 * @copyright tama asrory ridhana
 * @format
 * @flow strict-local
 */

import React, {memo} from 'react';
import {Provider as PaperProvider} from 'react-native-paper';
import LocationStore from './src/store/LocationStore';
import {NavigationContainer} from '@react-navigation/native';
import {Provider} from 'mobx-react';
import {theme} from './src/core/theme';
import {createStackNavigator} from '@react-navigation/stack';
import OrderScreen from './src/screens/OrderScreen';
import OrderStore from './src/store/OrderStore';
import CartScreen from './src/screens/CartScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import MapsScreen from './src/screens/MapsScreen';
import SyaratMemberScreen from './src/screens/SyaratMemberScreen';
import KeuntunganScreen from './src/screens/KeuntunganScreen';
import KatalogScreen from './src/screens/KatalogScreen';
import HomeScreen from './src/screens/HomeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import AccountScreen from './src/screens/AccountScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import SplashScreen from './src/screens/SplashScreen';
import {
  BackHandler,
  Animated,
  Dimensions,
  Text,
  TouchableOpacity,
} from 'react-native';

// eslint-disable-next-line no-extend-native
String.prototype.formatNumber =
  String.prototype.formatNumber ||
  function() {
    'use strict';
    var parts = this.toString().split('.');
    return (
      parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') +
      (parts[1] ? ',' + parts[1] : '')
    );
  };

// eslint-disable-next-line no-extend-native
String.prototype.formatUnicorn =
  String.prototype.formatUnicorn ||
  function() {
    'use strict';
    var str = this.toString();
    if (arguments.length) {
      var t = typeof arguments[0];
      var key;
      var args =
        t === 'string' || t === 'number'
          ? Array.prototype.slice.call(arguments)
          : arguments[0];

      for (key in args) {
        str = str.replace(new RegExp('\\{' + key + '\\}', 'gi'), args[key]);
      }
    }

    return str;
  };

const Stack = createStackNavigator();
let {width, height} = Dimensions.get('window');

class App extends React.PureComponent {
  state = {
    backClickCount: 0,
  };

  constructor(props) {
    super(props);

    this.springValue = new Animated.Value(2000);
  }
  componentWillMount() {
    BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackButton.bind(this),
    );
  }

  componentWillUnmount() {
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this.handleBackButton.bind(this),
    );
  }

  _spring() {
    this.setState({backClickCount: 1}, () => {
      Animated.sequence([
        Animated.spring(this.springValue, {
          toValue: 0,
          friction: 5,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(this.springValue, {
          toValue: 90,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        this.setState({backClickCount: 0});
      });
    });
  }

  handleBackButton = () => {
    this.state.backClickCount === 1 ? BackHandler.exitApp() : this._spring();

    return true;
  };
  render() {
    console.info('#render : ', 'App.js');
    return (
      <PaperProvider theme={theme}>
        <Provider store={LocationStore} orderStore={OrderStore}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="SplashScreen">
              <Stack.Screen
                name="SplashScreen"
                component={SplashScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="LoginScreen"
                component={LoginScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="RegisterScreen"
                component={RegisterScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="ForgotPasswordScreen"
                component={ForgotPasswordScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="MainScreen"
                component={HomeScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="OrderScreen"
                component={OrderScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="HistoryScreen"
                component={HistoryScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="ProgressScreen"
                component={ProgressScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="CartScreen"
                component={CartScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="MapsScreen"
                component={MapsScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="KatalogScreen"
                component={KatalogScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="AccountScreen"
                component={AccountScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="SyaratMemberScreen"
                component={SyaratMemberScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="KeuntunganScreen"
                component={KeuntunganScreen}
                options={{headerShown: false}}
              />
            </Stack.Navigator>
          </NavigationContainer>
          <Animated.View
            style={[
              styles.animatedView,
              {transform: [{translateY: this.springValue}]},
            ]}>
            <Text style={styles.exitTitleText}>
              Klik tombol kembali dua kali untuk keluar dari aplikasi
            </Text>
          </Animated.View>
        </Provider>
      </PaperProvider>
    );
  }
}
const styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animatedView: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.50)',
    position: 'absolute',
    borderRadius: 50,
    bottom: 20,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitTitleText: {
    textAlign: 'center',
    color: '#ffffff',
  },
};
export default memo(App);
