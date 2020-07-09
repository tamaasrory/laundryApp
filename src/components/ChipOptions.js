import {Chip} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './Styles';
import {View} from 'react-native';
import React from 'react';

class ChipOptions extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    /**
     * options = {{key: '', name: ''}}
     * onChange = (key) => { this.setState({storeName: key})}
     * isSelected = (key) => (storeName === key)
     */
    const {options, onChange, isSelected} = this.props;
    return (
      <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
        {options.map((e, i) => (
          <Chip
            key={i}
            avatar={
              <MaterialCommunityIcons
                name={e.icon}
                size={e.iconSize}
                color={e.iconColor}
              />
            }
            mode={'flat'}
            style={styles.chip1}
            textStyle={{fontSize: 14}}
            onPress={() => onChange(e)}
            selected={isSelected(e)}>
            {e.leftElement}
            {e.label}
            {e.rightElement}
          </Chip>
        ))}
      </View>
    );
  }
}

export default ChipOptions;
