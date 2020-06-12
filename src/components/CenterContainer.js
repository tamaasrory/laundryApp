import React, {memo} from 'react';
import {View, ScrollView} from 'react-native';
import styles from './Styles';

const CenterContainer = ({children}) => (
  <ScrollView contentContainerStyle={styles.scrollView}>
    <View style={styles.centerContainer} behavior="padding">
      {children}
    </View>
  </ScrollView>
);

export default memo(CenterContainer);
