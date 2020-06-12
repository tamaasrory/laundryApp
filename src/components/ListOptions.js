import {View} from 'react-native';
import {ListItem} from 'react-native-elements';
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
    const {options, onChange, isSelected, containerStyle} = this.props;
    return (
      <View>
        {options.map((e, i) => (
          <ListItem
            key={i}
            underlayColor={'#fff'}
            leftAvatar={e.leftAvatar}
            leftElement={e.leftElement}
            rightAvatar={e.rightAvatar}
            rightElement={e.rightElement}
            title={e.title}
            subtitle={e.subtitle}
            containerStyle={
              containerStyle &&
              (isSelected
                ? containerStyle(isSelected(e.value))
                : containerStyle)
            }
            onPress={() => onChange && onChange(e.value)}
          />
        ))}
      </View>
    );
  }
}

export default ChipOptions;
