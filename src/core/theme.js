import {DefaultTheme} from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#0086ff', // 950077
    statusBar: '#007aea', // 810066
    secondary: '#414757',
    error: '#f13a59',
    accent: '#f13a59',
    green: '#4aa100',
    grey: '#a1a1a1',
    tabHome: /*'#0086ff', */ '#0086ff',
    tabHomeStatusBar: /*'#007aea', */ '#0086ff',
    tabOrder: '#fff', // '#0086ff', // '#1a8945',
    tabOrderStatusBar: '#fff', // '#0071e2', // '#188944',
    tabHistory: /*'#0086ff', */ '#7d8397',
    tabHistoryStatusBar: /*'#007aea', */ '#6d7386',
    tabProgress: /*'#0086ff', */ '#4aa100',
    tabProgressStatusBar: /*'#007aea', */ '#4aa100',
    tabAccount: /*'#0086ff', */ '#fff',
    tabAccountStatusBar: /*'#007aea', */ '#fff',
    textToolBar: '#000',
    white: '#fff',
  },
};
