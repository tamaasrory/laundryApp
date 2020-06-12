/**
 * @flow
 */
import React from 'react';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import HistoryScreen from './HistoryScreen';
import AccountScreen from './AccountScreen';
import HomeScreen from './HomeScreen';
import {inject, observer, Provider} from 'mobx-react';
import KatalogScreen from './KatalogScreen';
import {theme} from '../core/theme';

const BottomTab = createMaterialBottomTabNavigator();

@inject('store', 'orderStore')
@observer
class MainScreen extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    console.info('#render : ', this.constructor.name);
    return (
      <Provider store={this.props.store} orderStore={this.props.orderStore}>
        <BottomTab.Navigator
          shifting={false}
          initialRouteName="Home"
          barStyle={{backgroundColor: theme.colors.primary}}
          activeColor={'rgba(255,255,255,0.75)'}>
          <BottomTab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              tabBarLabel: 'Home',
              tabBarColor: theme.colors.tabHome,
              tabBarIcon: ({color}) => (
                <MaterialCommunityIcons name="home" color={color} size={26} />
              ),
            }}
          />
          <BottomTab.Screen
            name="Order"
            component={KatalogScreen}
            options={{
              tabBarLabel: 'Order',
              tabBarColor: theme.colors.tabOrder,
              tabBarIcon: ({color}) => (
                <MaterialCommunityIcons
                  name="shopping"
                  color={color}
                  size={26}
                />
              ),
            }}
          />
          <BottomTab.Screen
            name="History"
            component={HistoryScreen}
            options={{
              tabBarLabel: 'Riwayat',
              tabBarColor: theme.colors.tabHistory,
              tabBarIcon: ({color}) => (
                <MaterialCommunityIcons
                  name="history"
                  color={color}
                  size={26}
                />
              ),
            }}
          />
          <BottomTab.Screen
            name="Account"
            component={AccountScreen}
            options={{
              tabBarLabel: 'Profil',
              tabBarColor: theme.colors.tabAccount,
              tabBarIcon: ({color}) => (
                <MaterialCommunityIcons
                  name="account"
                  color={color}
                  size={26}
                />
              ),
            }}
          />
        </BottomTab.Navigator>
      </Provider>
    );
  }
}

export default MainScreen;
