import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';

const slides = [
  {
    key: 1,
    title: 'Title 1',
    text: 'Description.\nSay something cool',
    // image: require('./assets/1.jpg'),
    backgroundColor: '#59b2ab',
  },
  {
    key: 2,
    title: 'Title 2',
    text: 'Other cool stuff',
    // image: require('./assets/2.jpg'),
    backgroundColor: '#febe29',
  },
  {
    key: 3,
    title: 'Rocket guy',
    text: "I'm already out of descriptions\n\nLorem ipsum bla bla bla",
    // image: require('./assets/3.jpg'),
    backgroundColor: '#22bcb5',
  },
];

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    resizeMode: 'cover',
  },
  text: {
    color: '#333',
    marginTop: 92,
    textAlign: 'center',
  },
});

export default class AppIntroScreen extends React.Component {
  state = {
    showRealApp: false,
  };

  _renderItem = ({item}) => {
    return (
      <View style={styles.slide}>
        <Text style={styles.title}>{item.title}</Text>
        {/*<Image source={item.image} />*/}
        <Text style={styles.text}>{item.text}</Text>
      </View>
    );
  };
  _onDone = () => {
    // User finished the introduction. Show real app through
    // navigation or simply by controlling state
    this.setState({showRealApp: true});
  };
  render() {
    if (this.state.showRealApp) {
      this.props.navigation.reset({
        index: 0,
        routes: [{name: 'MainScreen'}],
      });
    } else {
      return (
        <AppIntroSlider
          renderItem={this._renderItem}
          data={slides}
          onDone={this._onDone}
        />
      );
    }
  }
}
