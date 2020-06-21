import React from 'react';
import Carousel, {ParallaxImage} from 'react-native-snap-carousel';
import {View, Text, Dimensions, StyleSheet, Platform} from 'react-native';

const ENTRIES1 = [
  {
    title: 'Beautiful and dramatic Antelope Canyon',
    subtitle: 'Lorem ipsum dolor sit amet et nuncat mergitur',
    illustration: 'https://i.imgur.com/UYiroysl.jpg',
  },
  {
    title: 'Earlier this morning, NYC',
    subtitle: 'Lorem ipsum dolor sit amet',
    illustration: 'https://i.imgur.com/UPrs1EWl.jpg',
  },
  {
    title: 'White Pocket Sunset',
    subtitle: 'Lorem ipsum dolor sit amet et nuncat ',
    illustration: 'https://i.imgur.com/MABUbpDl.jpg',
  },
  {
    title: 'Acrocorinth, Greece',
    subtitle: 'Lorem ipsum dolor sit amet et nuncat mergitur',
    illustration: 'https://i.imgur.com/KZsmUi2l.jpg',
  },
  {
    title: 'The lone tree, majestic landscape of New Zealand',
    subtitle: 'Lorem ipsum dolor sit amet',
    illustration: 'https://i.imgur.com/2nCt3Sbl.jpg',
  },
];
const {width: screenWidth} = Dimensions.get('window');

class MyCarousel extends React.Component {
  state = {entries: null};

  constructor(props) {
    super(props);
  }

  componentDidMount(): void {
    this.setState({entries: ENTRIES1});
  }

  renderItem = ({item, index}, parallaxProps) => {
    return (
      <View style={styles.carousel_item}>
        <ParallaxImage
          source={{uri: item.illustration}}
          containerStyle={styles.carousel_image_container}
          style={styles.carousel_image}
          parallaxFactor={0}
          {...parallaxProps}
        />
        <Text
          style={{
            bottom: 10,
            marginLeft: 10,
            color: '#fff',
            position: 'absolute',
          }}
          numberOfLines={2}>
          {item.title}
        </Text>
      </View>
    );
  };
  render() {
    return (
      <View style={styles.container}>
        <Carousel
          sliderWidth={screenWidth}
          sliderHeight={180}
          itemWidth={screenWidth - 60}
          data={this.state.entries}
          renderItem={this.renderItem}
          hasParallaxImages={true}
          loop={true}
          loopClonesPerSide={2}
          autoplay={true}
          autoplayInterval={3000}
        />
      </View>
    );
  }
}

export default MyCarousel;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  carousel_item: {
    width: screenWidth - 60,
    height: 180,
  },
  carousel_image_container: {
    flex: 1,
    marginBottom: Platform.select({ios: 0, android: 1}), // Prevent a random Android rendering issue
    backgroundColor: 'white',
    borderRadius: 8,
  },
  carousel_image: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
});
