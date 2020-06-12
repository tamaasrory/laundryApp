import {TouchableHighlight, View} from 'react-native';
import {Input} from 'react-native-elements';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import React from 'react';
import styles from './Styles';

class DateTimePicker extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      value,
      onPress,
      hint,
      label,
      icon,
      iconColor,
      style,
      textStyle,
    } = this.props;
    return (
      <View style={style}>
        <TouchableHighlight onPress={onPress} underlayColor={'transparent'}>
          <Input
            placeholder={hint}
            label={label}
            labelStyle={styles.fnt_14_secondary}
            value={value}
            inputStyle={[textStyle, {paddingVertical: 0}]}
            containerStyle={{
              paddingHorizontal: 0,
              marginHorizontal: 0,
            }}
            inputContainerStyle={{
              borderBottomColor: '#fff',
              backgroundColor: 'rgba(0,0,0,0.04)',
              borderRadius: 15,
              paddingHorizontal: 8,
            }}
            disabled
            rightIcon={
              <MaterialCommunityIcons name={icon} size={24} color={iconColor} />
            }
          />
        </TouchableHighlight>
      </View>
    );
  }
}

export default DateTimePicker;
