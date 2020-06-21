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

const App: () => React$Node = () => {
  console.info('#render : ', 'App.js');
  return (
    <PaperProvider theme={theme}>
      <Provider store={LocationStore} orderStore={OrderStore}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="LoginScreen">
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
      </Provider>
    </PaperProvider>
  );
};

export default memo(App);
