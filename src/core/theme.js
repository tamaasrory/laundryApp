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
    tabHome: '#0086ff', // '#0086ff',
    tabHomeStatusBar: '#007aea', //'#0071e2'
    tabOrder: '#0086ff', // '#1dbc60',
    tabOrderStatusBar: '#007aea', //'#1bae59'
    tabHistory: '#0086ff', // '#7d8397',
    tabHistoryStatusBar: '#007aea', //'#6d7386'
    tabAccount: '#0086ff', // '#ff9e00',
    tabAccountStatusBar: '#007aea', //'#ed9100'
  },
};
