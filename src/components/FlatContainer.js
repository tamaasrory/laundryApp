import React, {memo} from 'react';
import {View, ScrollView, RefreshControl} from 'react-native';
import styles from './Styles';

function wait(timeout) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
}
const FlatContainer = ({children, style, ...props}) => {
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    props.onRefresh();
    wait(props.timeout ? props.timeout : 2000).then(() => setRefreshing(false));
  }, [props]);

  return (
    <ScrollView
      contentContainerStyle={styles.scrollView}
      onLayout={event =>
        props.onLayout ? props.onLayout(event.nativeEvent.layout) : {}
      }
      refreshControl={
        props.onRefresh ? (
          <RefreshControl
            progressBackgroundColor={'#fff'}
            colors={['#ff4c51', '#ffd12b', '#5ed757']}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        ) : null
      }>
      <View style={[styles.flatContainer, style]} behavior="padding">
        {children}
      </View>
    </ScrollView>
  );
};

export default memo(FlatContainer);
