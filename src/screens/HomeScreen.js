/**
 * @flow strict-local
 */
import React from 'react';
import {ListItem, Text} from 'react-native-elements';
import FlatContainer from '../components/FlatContainer';
import Carousel, {ParallaxImage} from 'react-native-snap-carousel';
import {
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  TouchableHighlight,
  View,
} from 'react-native';
import User from '../store/User';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {theme} from '../core/theme';
import RestApi from '../router/Api';
import Path from '../router/Path';

const {width: screenWidth} = Dimensions.get('window');

const style = StyleSheet.create({
  carousel_item: {
    width: screenWidth - 50,
    height: 200,
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

class HomeScreen extends React.PureComponent {
  input = null;
  state = {banners: null, errorLoadingData: false};

  constructor(props) {
    super(props);
    this.initData();
  }

  async initData() {
    const {getName} = new User();
    this.setState({name: await getName()});
  }

  componentDidMount(): void {
    this.loadBanner();
  }

  loadBanner() {
    RestApi.get('/banner/all-active')
      .then(res => {
        console.log('response banner', res.data.value);
        this.setState({
          banners: res.data.value,
          isLoading: false,
          errorLoadingData: false,
        });
      })
      .catch(err => {
        this.setState({
          banners: [
            {
              title:
                'Tidak dapat memuat gambar, sepertinya Ada masalah. silahkan periksa jaringan data anda',
            },
          ],
          isLoading: false,
          errorLoadingData: true,
        });
        console.log('error banner', err);
      });
  }
  renderItem = ({item, index}, parallaxProps) => {
    return (
      <View style={style.carousel_item}>
        <ParallaxImage
          source={
            this.state.errorLoadingData
              ? require('../assets/image404.svg')
              : {
                  uri: `${Path.BannerImage}/${item.image}`,
                }
          }
          containerStyle={style.carousel_image_container}
          style={style.carousel_image}
          parallaxFactor={0}
          {...parallaxProps}
        />
        <View
          style={{
            bottom: 0,
            position: 'absolute',
            width: '100%',
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
            backgroundColor: '#007aea',
            paddingVertical: 10,
            paddingHorizontal: 15,
          }}>
          <Text style={{color: '#fff'}} numberOfLines={2}>
            {item.title}
          </Text>
        </View>
      </View>
    );
  };

  menu = [
    {
      icon: {name: 'shopping', color: theme.colors.accent},
      title: 'Pesan',
      subtitle:
        'Ada barang atau pakaian kotor ?, Pilih menu ini untuk memesan laundry',
      onPress: () => {
        this.props.navigation.navigate('KatalogScreen');
      },
    },
    {
      icon: {name: 'progress-clock', color: '#4aa100'},
      title: 'Sedang Diproses',
      subtitle: 'lihat informasi tentang pesanan kamu yang sedang diproses',
      onPress: () => {
        this.props.navigation.navigate('ProgressScreen');
      },
    },
    {
      icon: {name: 'history', color: theme.colors.backdrop},
      title: 'Riwayat',
      subtitle: 'lihat informasi pesanan yang pernah kamu lakukan',
      onPress: () => {
        this.props.navigation.navigate('HistoryScreen');
      },
    },
  ];

  render() {
    console.info('#render : ', this.constructor.name);
    return (
      <FlatContainer>
        <View
          style={{
            backgroundColor: theme.colors.primary,
            position: 'absolute',
            height: '100%',
            width: '100%',
          }}
        />
        <StatusBar
          backgroundColor={theme.colors.tabHomeStatusBar}
          barStyle={'light-content'}
        />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 20,
            marginLeft: 25,
            marginBottom: 30,
          }}>
          <View>
            <View style={{flexDirection: 'row'}}>
              <Text style={{fontSize: 19, color: '#fff'}}>Hi </Text>
              <Text style={{fontSize: 19, fontWeight: 'bold', color: '#fff'}}>
                {this.state.name},
              </Text>
            </View>
            <Text style={{color: '#fff'}}>Kami siap melayani anda</Text>
          </View>
          <TouchableHighlight
            style={{
              alignSelf: 'center',
              marginRight: 25,
              borderRadius: 50,
            }}
            underlayColor={'rgba(0,0,0,0.08)'}
            onPress={() => {
              this.props.navigation.navigate('AccountScreen');
            }}>
            <MaterialCommunityIcons
              style={{
                alignSelf: 'center',
                padding: 5,
                backgroundColor: '#fff',
                borderRadius: 50,
              }}
              name="account"
              color={theme.colors.primary}
              size={23}
            />
          </TouchableHighlight>
        </View>

        <View style={{height: 200}}>
          <Carousel
            sliderWidth={screenWidth}
            sliderHeight={200}
            itemWidth={screenWidth - 50}
            data={this.state.banners}
            renderItem={this.renderItem}
            hasParallaxImages={true}
            loop={true}
            autoplay={true}
            autoplayInterval={3000}
          />
        </View>
        <View
          style={{
            backgroundColor: '#fff',
            position: 'absolute',
            bottom: 0,
            height: '47%',
            paddingTop: 15,
            width: '100%',
            borderTopRightRadius: 35,
            borderTopLeftRadius: 35,
          }}>
          {this.menu.map(data => {
            return (
              <ListItem
                underlayColor={'transparent'}
                containerStyle={{
                  paddingLeft: 25,
                  paddingVertical: 10,
                  backgroundColor: 'transparent',
                }}
                leftAvatar={
                  <View
                    style={{
                      padding: 10,
                      borderRadius: 15,
                      width: 48,
                      height: 48,
                      backgroundColor: data.icon.color,
                      alignSelf: 'center',
                    }}>
                    <MaterialCommunityIcons
                      style={{alignSelf: 'center'}}
                      name={data.icon.name}
                      color={'#fff'}
                      size={24}
                    />
                  </View>
                }
                title={data.title}
                subtitle={data.subtitle}
                onPress={data.onPress}
              />
            );
          })}
          <Text
            style={{
              color: 'grey',
              fontSize: 10,
              alignSelf: 'center',
              bottom: 20,
              position: 'absolute',
            }}>
            v.1.0 BETA
          </Text>
        </View>
      </FlatContainer>
    );
  }
}

export default HomeScreen;
