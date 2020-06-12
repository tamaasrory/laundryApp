import React from 'react';
import FlatContainer from '../components/FlatContainer';
import {Button, Divider, Input, Text} from 'react-native-elements';
import styles from '../components/Styles';
import DateTimePicker from '../components/DateTimePicker';
import {TouchableHighlight, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import {theme} from '../core/theme';
import {inject, observer} from 'mobx-react';
import {ProgressBar} from '@react-native-community/progress-bar-android';
import AlertDialog from '../components/AlertDialog';
import RestApi from '../router/Api';
import TextInputMask from 'react-native-text-input-mask';

@inject('store', 'orderStore')
@observer
class OrderScreen extends React.PureComponent {
  state = {
    // date picker
    timeJemput: new Date(),
    timeAntar: new Date(),
    dateJemput: new Date(),
    dateAntar: new Date(),
    // setter
    showJemput: false,
    // showAntar: false,
    modePickerJemput: 'date',
    modePickerAntar: 'date',

    waktuJemput: null,
    // waktuAntar: null,
    noHp: null,
    alamat: null,
    latitude: null,
    longitude: null,
    catatan: null,

    response: {
      icon: {name: 'check', color: '#36cb04'},
      msg: 'test messagessss',
    },

    showProgressDialog: false,
    showIncomplateDialog: false,
    showResponseDialog: false,
  };

  /** @type LocationStore */
  store = null;

  constructor(props) {
    super(props);
    this.store = this.props.store;
  }

  resetValue() {
    this.props.orderStore.setData([]);
    this.setState({
      waktuJemput: null,
      // waktuAntar: null,
      noHp: null,
      alamat: null,
      latitude: null,
      longitude: null,
      catatan: null,
    });
  }

  componentDidMount(): void {
    this.store.callbackDataTrigger(() => this.updateAlamat());
  }

  onChangeTimeJemput = (event, selected) => {
    const current = selected || this.state.timeJemput;
    this.setState({showJemput: false, timeJemput: current});
    this.setWaktu('waktuJemput', 'dateJemput', 'timeJemput');
  };

  // onChangeTimeAntar = (event, selected) => {
  //   const current = selected || this.state.timeAntar;
  //   this.setState({showAntar: false, timeAntar: current});
  //   this.setWaktu('waktuAntar', 'dateAntar', 'timeAntar');
  // };

  onChangeDateJemput = (event, selected) => {
    const current = selected || this.state.dateJemput;
    this.setState({showJemput: false, dateJemput: current});
    this.setWaktu('waktuJemput', 'dateJemput', 'timeJemput');
  };

  // onChangeDateAntar = (event, selected) => {
  //   const current = selected || this.state.dateAntar;
  //   this.setState({showAntar: false, dateAntar: current});
  //   this.setWaktu('waktuAntar', 'dateAntar', 'timeAntar');
  // };

  convert = v => (v.toString().length === 2 ? v : `0${v}`);

  convertDate = (value, format) => {
    try {
      let D = this.convert(value.getDate());
      let M = this.convert(value.getMonth() + 1);
      let Y = value.getFullYear();
      return format.formatUnicorn({D: D, M: M, Y: Y});
    } catch (e) {
      return '';
    }
  };

  convertTime = value =>
    this.convert(value.getHours()) + ':' + this.convert(value.getMinutes());

  setWaktu(newKey, keyDate, keyTime) {
    let val = {};
    let date = '';
    let time = '';

    // eslint-disable-next-line no-eval
    eval(`date = this.state.${keyDate}`);
    // eslint-disable-next-line no-eval
    eval(`time = this.state.${keyTime}`);

    date = date ? this.convertDate(date, '{Y}-{M}-{D}') : date;
    time = time ? this.convertTime(time) : time;

    // eslint-disable-next-line no-eval
    eval(`val.${newKey}='${date} ${time}:00'`);

    this.setState(val);
  }

  isSelectedPesanan = key => this.state.pesanan === key;

  updateAlamat() {
    const {getGeocode, getLatitude, getLongitude} = this.store;
    this.setState({
      alamat: getGeocode ? getGeocode.formattedAddress : null,
      latitude: getLatitude ? getLatitude : null,
      longitude: getLongitude ? getLongitude : null,
    });
  }

  getData() {
    const {
      waktuJemput,
      // waktuAntar,
      noHp,
      alamat,
      latitude,
      longitude,
      catatan,
    } = this.state;
    if (
      waktuJemput &&
      // waktuAntar &&
      noHp &&
      alamat &&
      latitude &&
      longitude &&
      catatan
    ) {
      return {
        barang: this.props.orderStore.getData,
        waktuJemput: waktuJemput,
        // waktuAntar: waktuAntar,
        noHp: noHp,
        alamat: alamat,
        latitude: latitude,
        longitude: longitude,
        catatan: catatan,
      };
    } else {
      return false;
    }
  }

  sendOrder() {
    console.log(JSON.stringify(this.getData()));
    let payload = this.getData();
    if (payload) {
      this.setState({showProgressDialog: true});
      RestApi.post('/order/baru', payload)
        .then(res => {
          console.log(res.data);
          this.setState({
            showProgressDialog: false,
            response: {
              icon: {name: 'check', color: '#36cb04'},
              msg: res.data.msg,
            },
            showResponseDialog: true,
          });
          this.resetValue();
        })
        .catch(e => {
          console.log('error send order', e);
          this.setState({
            showProgressDialog: false,
            response: {
              icon: {name: 'close', color: theme.colors.accent},
              msg: 'Belum berhasil mengirim pesanan, Silahkan coba lagi',
            },
            showResponseDialog: true,
          });
        });
    } else {
      this.setState({showIncomplateDialog: true});
      setTimeout(() => this.setState({showIncomplateDialog: false}), 5000);
    }
  }

  render() {
    const {
      timeJemput,
      dateJemput,
      showJemput,
      modePickerJemput,
      noHp,
      catatan,
      waktuJemput,
      // timeAntar,
      // dateAntar,
      // showAntar,
      // modePickerAntar,
      // waktuAntar,
      alamat,
    } = this.state;
    console.info('#render : ', this.constructor.name);
    console.log('order Data ==> ', this.props.orderStore.getData);
    return (
      <View style={{backgroundColor: '#fff', flexGrow: 1}}>
        <View
          style={{
            flexDirection: 'row',
            paddingVertical: 8,
            elevation: 4,
            backgroundColor: theme.colors.primary,
          }}>
          <Button
            type={'clear'}
            onPress={() => this.props.navigation.goBack()}
            containerStyle={{justifyContent: 'center'}}
            icon={
              <MaterialCommunityIcons
                name={'arrow-left'}
                size={28}
                color={'white'}
              />
            }
          />
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
              paddingHorizontal: 15,
            }}>
            <Text style={[styles.textHeader, {color: '#fff'}]}>
              Order Laundry
            </Text>
            <Text
              style={[styles.textSecondary, {color: '#fff', marginTop: -3}]}>
              Lengkapi data berikut
            </Text>
          </View>
        </View>

        <View style={{flex: 1, height: 100}}>
          <FlatContainer style={{paddingHorizontal: 25, paddingTop: 10}}>
            <Text style={[styles.textSecondary, {marginVertical: 10}]}>
              Nikmati kemudahan mencuci dengan Ethan Laundry. Yuk order laundry
              sekarang!
            </Text>
            <Text style={[styles.textLabel, {marginVertical: 10}]}>
              Waktu Jemput
            </Text>
            <View style={styles.rowsBetween}>
              <DateTimePicker
                value={
                  waktuJemput ? this.convertDate(dateJemput, '{D}/{M}/{Y}') : ''
                }
                onPress={() =>
                  this.setState({showJemput: true, modePickerJemput: 'date'})
                }
                hint={'Tanggal'}
                label={null}
                icon={'calendar-outline'}
                iconColor={'orange'}
                style={{width: '58%'}}
              />
              <DateTimePicker
                value={waktuJemput ? this.convertTime(timeJemput) : ''}
                onPress={() =>
                  this.setState({showJemput: true, modePickerJemput: 'time'})
                }
                hint={'Jam'}
                label={null}
                icon={'clock-outline'}
                iconColor={'orange'}
                style={{width: '40%'}}
              />
            </View>

            {/*<View style={{flexDirection: 'row'}}>
              <DateTimePicker
                value={
                  waktuAntar ? this.convertDate(dateAntar, '{D}/{M}/{Y}') : ''
                }
                onPress={() =>
                  this.setState({showAntar: true, modePickerAntar: 'date'})
                }
                hint={'00/00/0000'}
                label={'Waktu Antar'}
                icon={'calendar-outline'}
                iconColor={'green'}
                style={{width: '60%'}}
              />

              <DateTimePicker
                value={waktuAntar ? this.convertTime(timeAntar) : ''}
                onPress={() =>
                  this.setState({showAntar: true, modePickerAntar: 'time'})
                }
                hint={'00:00'}
                label={''}
                icon={'clock-outline'}
                iconColor={'green'}
                style={{width: '40%'}}
                textStyle={{textAlign: 'center'}}
              />
            </View>*/}

            <Divider style={[styles.divider, {marginVertical: 10}]} />

            <Text style={styles.textLabel}>Nomor Ponsel</Text>
            <View
              style={{
                flexDirection: 'row',
                marginRight: 10,
                borderBottomColor: 'grey',
                borderBottomWidth: 1,
              }}>
              <View style={{justifyContent: 'center'}}>
                <MaterialCommunityIcons
                  name={'phone'}
                  size={24}
                  color={'green'}
                />
              </View>
              <TextInputMask
                placeholder={'+62-xxx-xxxx-xxxx'}
                onChangeText={(formatted, extracted) => {
                  console.log('nomer hp', extracted);
                  this.setState({noHp: extracted});
                }}
                defaultValue={noHp}
                keyboardType={'phone-pad'}
                style={{
                  flex: 1,
                  marginLeft: 7,
                  fontSize: 16,
                }}
                mask={'+[00]-[000]-[0000]-[000000]'}
              />
            </View>

            {/*<Input
              label={'Nomor Ponsel'}
              labelStyle={styles.fnt_14_secondary}
              inputStyle={styles.mp_lr_0}
              maxLength={16}
              keyboardType={'phone-pad'}
              containerStyle={styles.mp_l_0}
              leftIconContainerStyle={styles.ml0_ph10}
              leftIcon={
                <MaterialCommunityIcons
                  name={'phone'}
                  size={24}
                  color={'green'}
                />
              }
              value={noHp}
              onChangeText={text => {
                this.setState({noHp: text});
              }}
            />*/}

            <Divider style={[styles.divider, {marginVertical: 10}]} />
            <Text style={styles.textLabel}>Alamat</Text>
            <TouchableHighlight
              underlayColor={'transparent'}
              onPress={() => {
                this.props.navigation.navigate('MapsScreen');
              }}>
              <Input
                label={null}
                inputStyle={[styles.mp_lr_0, {fontSize: 13}]}
                multiline
                maxLength={250}
                containerStyle={styles.mp_l_0}
                leftIconContainerStyle={styles.ml0_ph10}
                disabled
                leftIcon={
                  <MaterialCommunityIcons
                    name={'google-maps'}
                    size={24}
                    color={'blue'}
                  />
                }
                value={
                  alamat
                    ? alamat
                    : 'Klik disini untuk mengisi alamat anda dari maps'
                }
              />
            </TouchableHighlight>
            <Divider style={[styles.divider, {marginVertical: 10}]} />
            <Input
              label={'Catatan'}
              labelStyle={styles.fnt_14_secondary}
              inputStyle={[styles.mp_lr_0, {fontSize: 15}]}
              multiline
              maxLength={160}
              clearButtonMode={'always'}
              containerStyle={styles.mp_l_0}
              leftIconContainerStyle={styles.ml0_ph10}
              leftIcon={
                <MaterialCommunityIcons
                  name={'paperclip'}
                  size={24}
                  color={'grey'}
                />
              }
              value={catatan}
              onChangeText={text => {
                this.setState({catatan: text});
              }}
            />
            <Divider style={[styles.divider, {marginVertical: 50}]} />
            {showJemput && (
              <RNDateTimePicker
                timeZoneOffsetInMinutes={0}
                value={modePickerJemput === 'date' ? dateJemput : timeJemput}
                mode={modePickerJemput}
                is24Hour={true}
                display="default"
                onChange={
                  modePickerJemput === 'date'
                    ? this.onChangeDateJemput
                    : this.onChangeTimeJemput
                }
              />
            )}
            {/*{showAntar && (
            <RNDateTimePicker
              timeZoneOffsetInMinutes={0}
              value={modePickerAntar === 'date' ? dateAntar : timeAntar}
              mode={modePickerAntar}
              is24Hour={true}
              display="default"
              onChange={
                modePickerAntar === 'date'
                  ? this.onChangeDateAntar
                  : this.onChangeTimeAntar
              }
            />
          )}*/}
          </FlatContainer>
          <View
            style={{
              justifyContent: 'flex-end',
              marginBottom: 0,
            }}>
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                flexDirection: 'row',
                justifyContent: 'center',
                backgroundColor: '#fff',
                width: '100%',
                paddingVertical: 20,
              }}>
              <Button
                type={'outline'}
                title={'Kirim Laundry'}
                titleStyle={{paddingRight: 5, fontSize: 17, color: '#1dbc60'}}
                buttonStyle={{width: '100%', borderColor: '#1dbc60'}}
                icon={
                  <MaterialCommunityIcons
                    size={24}
                    name={'arrow-top-right'}
                    color={'#1dbc60'}
                  />
                }
                iconRight
                onPress={() => this.sendOrder()}
              />
            </View>
          </View>
        </View>
        <AlertDialog
          visible={this.state.showProgressDialog}
          title="Sedang Mengirim"
          scrollable={false}
          dismissable={false}>
          <Text>Tunggu Sebentar ya, Sedang Mengirim Pesanan Anda</Text>
          <ProgressBar styleAttr="Horizontal" />
        </AlertDialog>

        <AlertDialog
          visible={this.state.showResponseDialog}
          scrollable={false}
          onDismiss={() => this.setState({showResponseDialog: false})}
          dismissable={true}>
          <View style={{alignItems: 'center'}}>
            <MaterialCommunityIcons
              name={this.state.response.icon.name}
              color={this.state.response.icon.color}
              size={90}
            />
            <Text style={{fontSize: 16, marginBottom: 15}}>
              {this.state.response.msg}
            </Text>
            <Button
              title={'OKE'}
              type="outline"
              buttonStyle={{paddingHorizontal: 25}}
              onPress={() => {
                this.setState({showResponseDialog: false});
                this.props.navigation.pop(2);
              }}
            />
          </View>
        </AlertDialog>

        <AlertDialog
          visible={this.state.showIncomplateDialog}
          title="Lengkapi Data"
          dismissable={false}
          scrollable={false}
          btnRight={{
            title: 'Oke',
            onPress: () => {
              this.setState({showIncomplateDialog: false});
            },
          }}>
          <Text>Data Order Belum Terisi Lengkap, Periksa Kembali</Text>
        </AlertDialog>
      </View>
    );
  }
}

export default OrderScreen;
