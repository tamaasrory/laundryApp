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
  ScrollView,
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
import moment from 'moment';
import styles from '../components/Styles';
import {Colors} from 'react-native-paper';

const {width: screenWidth} = Dimensions.get('window');
const itemWidth = screenWidth;
const style = StyleSheet.create({
  carousel_item: {
    width: itemWidth,
  },
  carousel_image_container: {
    height: '100%',
    marginBottom: Platform.select({ios: 0, android: 1}), // Prevent a random Android rendering issue
    backgroundColor: 'white',
  },
  carousel_image: {
    resizeMode: 'stretch',
  },
});

class HomeScreen extends React.PureComponent {
  input = null;
  state = {
    banners: null,
    errorLoadingData: false,
    greeting1: 'Hi..',
    colorGreeting1: '#fff',
    bgcolorGreeting1: 'rgba(0,0,0,0.62)',
    greeting2: 'Selamat Datang...',
    colorGreeting2: '#fff',
    bgcolorGreeting2: 'rgba(0,0,0,0.62)',
  };

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
        // console.log('response banner', res.data);
        this.setState({
          greeting1: res.data.settings.greeting1,
          greeting2: res.data.settings.greeting2,
          colorGreeting1: res.data.colorGreeting1 || this.state.colorGreeting1,
          bgcolorGreeting1:
            res.data.bgcolorGreeting1 || this.state.bgcolorGreeting1,
          colorGreeting2: res.data.colorGreeting2 || this.state.colorGreeting2,
          bgcolorGreeting2:
            res.data.bgcolorGreeting2 || this.state.bgcolorGreeting2,
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
                  uri: `${Path.BannerImage}/${item.image}?q=${moment().format(
                    'YYYYMMDDHHiiss',
                  )}`,
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
            backgroundColor: this.state.bgcolorGreeting2,
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
            numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={{color: '#fff', fontSize: 13}} numberOfLines={3}>
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
      <View style={styles.flatContainer}>
        <FlatContainer onRefresh={() => this.loadBanner()}>
          <StatusBar backgroundColor={'#fff'} barStyle={'dark-content'} />
          <View style={{height: '50%', position: 'absolute'}}>
            <Carousel
              sliderWidth={screenWidth}
              itemWidth={itemWidth}
              data={this.state.banners}
              renderItem={this.renderItem}
              hasParallaxImages={true}
              loop={true}
              autoplay={true}
              autoplayInterval={6000}
              inactiveSlideScale={1}
            />
          </View>
          <View
            style={{
              backgroundColor: this.state.bgcolorGreeting2,
              top: '50%',
              height: '10%',
            }}
          />
        </FlatContainer>
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
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingTop: 5,
              paddingBottom: 10,
            }}>
            <View style={{width: '70%', marginLeft: 25}}>
              <Text
                style={{
                  fontSize: 16,
                  color: this.state.colorGreeting1,
                  fontWeight: 'bold',
                }}
                numberOfLines={1}>
                {this.state.greeting1}
              </Text>
              <Text
                numberOfLines={2}
                style={{color: this.state.colorGreeting2, fontSize: 13}}>
                {this.state.greeting2}
              </Text>
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
                  backgroundColor: Colors.blue500,
                  borderRadius: 50,
                }}
                name="account"
                color={'#fff'}
                size={24}
              />
            </TouchableHighlight>
          </View>
          <ScrollView
            style={{marginBottom: 30}}
            showsVerticalScrollIndicator={false}
            onScrollBeginDrag={e => {
              console.log(e);
            }}>
            {this.menu.map(data => {
              return (
                <ListItem
                  underlayColor={'transparent'}
                  containerStyle={{
                    paddingLeft: 25,
                    paddingVertical: 7,
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
                  subtitle={
                    <Text style={{fontSize: 13, color: Colors.grey600}}>
                      {data.subtitle}
                    </Text>
                  }
                  onPress={data.onPress}
                />
              );
            })}
          </ScrollView>

          <Text
            style={{
              color: 'grey',
              fontSize: 10,
              paddingVertical: 10,
              width: '100%',
              backgroundColor: '#fff',
              textAlign: 'center',
              bottom: 0,
              position: 'absolute',
            }}>
            v.1.0 BETA
          </Text>
        </View>
      </View>
    );
  }
}

export default HomeScreen;
