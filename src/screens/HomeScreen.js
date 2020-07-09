/**
 * @flow strict-local
 */
import React from 'react';
import {ListItem, Text} from 'react-native-elements';
import FlatContainer from '../components/FlatContainer';
import Carousel, {ParallaxImage} from 'react-native-snap-carousel';
import {Dimensions, Platform, StatusBar, StyleSheet, TouchableHighlight, View} from 'react-native';
import User from '../store/User';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {theme} from '../core/theme';
import RestApi from '../router/Api';
import Path from '../router/Path';

const {width: screenWidth} = Dimensions.get('window');
const itemWidth = screenWidth;
const style = StyleSheet.create({
  carousel_item: {
    width: itemWidth,
    height: '100%',
  },
  carousel_image_container: {
    flex: 1,
    marginBottom: Platform.select({ios: 0, android: 1}), // Prevent a random Android rendering issue
    backgroundColor: 'white',
    // borderRadius: 8,
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
            height: '40%',
            bottom: 0,
            position: 'absolute',
            width: '100%',
            //backgroundColor: 'rgba(0,0,0,0.4)',
            paddingVertical: 10,
            paddingHorizontal: 25,
          }}>
          <Text
            style={{
              color: '#fff',
              fontWeight: 'bold',
              marginBottom: 2,
              fontSize: 15,
            }}
            numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={{color: '#fff', fontSize: 13}} numberOfLines={2}>
            {item.description}
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
      icon: {name: 'history', color: '#5f5f5f'},
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
      <FlatContainer onRefresh={() => this.loadBanner()}>
        <View style={{height: '60%', position: 'absolute'}}>
          <Carousel
            sliderWidth={screenWidth}
            itemWidth={itemWidth}
            data={this.state.banners}
            renderItem={this.renderItem}
            hasParallaxImages={true}
            loop={true}
            autoplay={true}
            autoplayInterval={3000}
            inactiveSlideScale={1}
          />
        </View>
        <StatusBar backgroundColor={'#fff'} barStyle={'dark-content'} />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(0,0,0,0.34)',
            paddingTop: 10,
            paddingLeft: 25,
            paddingBottom: 10,
          }}>
          <View>
            <View style={{flexDirection: 'row'}}>
              <Text style={{fontSize: 19, color: '#fff'}}>Hi </Text>
              <Text style={{fontSize: 19, fontWeight: 'bold', color: '#fff'}}>
                {this.state.name?.substring(0, 11)}
                {this.state.name?.length > 11 ? '...' : ''},
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
              color={theme.colors.accent}
              size={23}
            />
          </TouchableHighlight>
        </View>
        <View
          style={{
            backgroundColor: '#fff',
            position: 'absolute',
            bottom: 0,
            height: '50%',
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
                leftElement={
                  <View
                    style={{
                      borderRadius: 15,
                      backgroundColor: '#000',
                      elevation: 3,
                    }}>
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
