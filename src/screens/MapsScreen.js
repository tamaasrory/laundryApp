/**
 * untuk pemilihan alamat jemput
 * @flow strict-local
 */
import React from 'react';
import {Image, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import MapView from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoder';
import marker from '../assets/icons8-marker.png';
import {check, openSettings, PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import {inject, observer} from 'mobx-react';
import {Button} from 'react-native-elements';
import {theme} from '../core/theme';

@inject('store')
@observer
class MapsScreen extends React.PureComponent {
  /** @type LocationStore */
  dataStore = {};

  constructor(props) {
    super(props);
    this.dataStore = props.store;
  }

  componentDidMount() {
    this.checkPermission();
  }

  checkPermission() {
    check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
      .then(result => {
        switch (result) {
          case RESULTS.UNAVAILABLE:
            console.warn(
              '#1 This feature is not available (on this device / in this context)',
            );
            break;
          case RESULTS.DENIED:
            // console.log(
            //   '#1 The permission has not been requested / is denied but requestable',
            // );
            this.requestPermission();
            break;
          case RESULTS.GRANTED:
            // console.log('#1 The permission is granted');
            this.getLocation();
            break;
          case RESULTS.BLOCKED: // kalau udah di block nggak bisa request permission lagi
            // console.log(
            //   '#1 The permission is denied and not requestable anymore',
            // );
            openSettings().catch(() => console.warn('#1 cannot open settings'));
            break;
        }
      })
      .catch(error => {
        console.error(error.code, error.message);
      });
  }

  requestPermission() {
    request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION).then(result => {
      switch (result) {
        case RESULTS.UNAVAILABLE:
          console.warn(
            '#2 This feature is not available (on this device / in this context)',
          );
          break;
        case RESULTS.DENIED:
          this.requestPermission();
          break;
        case RESULTS.GRANTED:
          // console.log('#2 The permission is granted');
          this.getLocation();
          break;
        case RESULTS.BLOCKED: // kalau udah di block nggak bisa request permission lagi
          // console.log(
          //   '#2 The permission is denied and not requestable anymore',
          // );
          openSettings().catch(() => console.warn('#2 cannot open settings'));
          break;
      }
    });
  }

  getLocation() {
    Geolocation.getCurrentPosition(
      position => {
        this.dataStore.setLatLang(
          position.coords.latitude,
          position.coords.longitude,
        );
      },
      error => {
        // See error code charts below.
        console.error(error.code, error.message);
      },
      {enableHighAccuracy: true, timeout: 200000, maximumAge: 10000},
    );
  }

  getAddress(latitude, longitude) {
    console.log('lat:' + latitude + ' long: ' + longitude);
    Geocoder.geocodePosition({
      lat: latitude,
      lng: longitude,
    })
      .then(res => {
        console.log('geocoder success => ', res);
        this.dataStore.setGeocode(res[0]);
      })
      .catch(onReject => {
        console.info('ada error dikit', onReject);
      });
  }

  onRegionChangeComplate = region => {
    this.getAddress(region.latitude, region.longitude);
    this.dataStore.setRegion(region);
    if (this.dataStore.disabledBtnLanjutkan) {
      this.dataStore.disableBtn(false);
      // console.log('complate', this.dataStore.disabledBtnLanjutkan);
    }
  };

  onRegionChange = region => {
    if (!this.dataStore.disabledBtnLanjutkan) {
      this.dataStore.disableBtn(true);
      console.log('change', this.dataStore.disabledBtnLanjutkan);
    }
  };

  render() {
    const {getRegion, getGeocode, disabledBtnLanjutkan} = this.dataStore;
    console.info('#render : ', this.constructor.name);
    return (
      <View style={styles.map}>
        <MapView
          style={styles.map}
          region={getRegion}
          onRegionChange={this.onRegionChange}
          onRegionChangeComplete={this.onRegionChangeComplate}
        />
        <View style={styles.markerFixed}>
          <Image style={styles.marker} source={marker} />
        </View>
        <SafeAreaView style={styles.footer}>
          <Text style={styles.labelAddress}>Alamat Jemput</Text>
          <Text style={styles.region}>
            {getGeocode
              ? getGeocode.formattedAddress
              : 'Alamat Tidak Ditemukan'}
          </Text>
          <Button
            title={'OKE'}
            disabled={disabledBtnLanjutkan}
            buttonStyle={styles.btnLanjutkan}
            type={'solid'}
            titleStyle={{color: '#fff'}}
            onPress={() => {
              this.dataStore.dataTrigger();
              this.props.navigation.goBack();
            }}
          />
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  markerFixed: {
    left: '50%',
    marginLeft: -24,
    marginTop: -48,
    position: 'absolute',
    top: '50%',
  },
  marker: {
    height: 48,
    width: 48,
  },
  footer: {
    backgroundColor: '#ffffff',
    bottom: 0,
    position: 'absolute',
    width: '100%',
  },
  labelAddress: {
    color: '#757575',
    marginHorizontal: 15,
    marginBottom: 5,
    paddingTop: 10,
    lineHeight: 20,
    fontWeight: 'bold',
  },
  region: {
    color: '#757575',
    marginHorizontal: 15,
    marginBottom: 10,
  },
  btnLanjutkan: {
    flex: 1,
    borderRadius: 15,
    backgroundColor: theme.colors.primary,
    marginHorizontal: 15,
    marginBottom: 15,
  },
});

export default MapsScreen;
