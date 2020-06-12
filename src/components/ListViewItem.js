import {ListItem} from 'react-native-elements';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import React, {memo} from 'react';
import styles from './Styles';
import {theme} from '../core/theme';

const ListViewItem = ({data, ...props}) => {
  return data.map((list, i) => (
    <ListItem
      key={i}
      underlayColor={'rgba(202,202,202,0.58)'}
      leftIcon={
        list.icon ? (
          <MaterialCommunityIcons
            name={list.icon.name}
            size={24}
            color={list.icon.color ? list.icon.color : theme.colors.primary}
          />
        ) : null
      }
      title={list.title}
      subtitle={list.subtitle}
      titleStyle={styles.titleList}
      subtitleStyle={styles.subtitleList}
      onPress={list.onPress ? list.onPress : () => {}}
      bottomDivider
    />
  ));
};

export default memo(ListViewItem);
