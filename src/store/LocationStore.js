/**
 * @flow strict-local
 */
import {action, computed, observable} from 'mobx';

class LocationStore {
  @observable geocode = null;
  @observable geolocation = null;
  @observable region = null;
  @observable latitude = 0.4760689;
  @observable longitude = 101.3806319;
  @observable latitudeDelta = 0.0025;
  @observable longitudeDelta = 0.0025;
  @observable disabledBtnLanjutkan = false;
  @observable callbackTrigger = null;

  @action disableBtn = value => {
    this.disabledBtnLanjutkan = value;
  };

  @action setGeocode = geocode => {
    this.geocode = geocode;
  };

  @action setGeolocation = geolocation => {
    this.geolocation = geolocation;
  };

  @action callbackDataTrigger = callback => {
    this.callbackTrigger = callback;
  };

  @action dataTrigger = () => {
    this.callbackTrigger();
  };

  @action setRegion = region => {
    this.latitude = region.latitude;
    this.longitude = region.longitude;
    this.latitudeDelta = region.latitudeDelta;
    this.longitudeDelta = region.longitudeDelta;
  };

  @action setLatLang = (lat: number, long: number) => {
    this.latitude = lat;
    this.longitude = long;
  };

  @action setLatitude = (value: number) => {
    this.latitude = value;
  };

  @action setLongitude = (value: number) => {
    this.longitude = value;
  };

  @action setLatitudeDelta = (value: number) => {
    this.latitudeDelta = value;
  };

  @action setLongitudeDelta = (value: number) => {
    this.longitudeDelta = value;
  };

  @computed get getGeocode() {
    return this.geocode;
  }

  @computed get getGeolocation() {
    return this.geolocation;
  }

  @computed get getRegion() {
    return {
      latitude: this.latitude,
      longitude: this.longitude,
      latitudeDelta: this.latitudeDelta,
      longitudeDelta: this.longitudeDelta,
    };
  }

  @computed get getLatitude(): number {
    return this.latitude;
  }

  @computed get getLongitude(): number {
    return this.longitude;
  }

  @computed get getLatitudeDelta(): number {
    return this.latitudeDelta;
  }

  @computed get getLongitudeDelta(): number {
    return this.longitudeDelta;
  }
}

export default new LocationStore();
