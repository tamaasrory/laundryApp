import React from 'react';
import FlatContainer from '../components/FlatContainer';
import {Button, Input, Text} from 'react-native-elements';
import styles from '../components/Styles';
import DateTimePicker from '../components/DateTimePicker';
import {Picker, TouchableHighlight, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import {theme} from '../core/theme';
import {inject, observer} from 'mobx-react';
import {ProgressBar} from '@react-native-community/progress-bar-android';
import AlertDialog from '../components/AlertDialog';
import TextInputMask from 'react-native-text-input-mask';
import RestApi from '../router/Api';

@inject('store', 'orderStore')
@observer
class OrderScreen extends React.PureComponent {
  date = new Date();
  state = {
    dateJemput: this.date,
    // setter
    showJemput: false,
    modePickerJemput: 'date',

    waktuJemput: null,
    noHp: null,
    alamat: null,
    latitude: null,
    longitude: null,
    catatan: null,
    selectedRangeWaktu: '',

    response: {
      icon: {name: 'check', color: '#36cb04'},
      msg: 'test messagessss',
    },

    showProgressDialog: false,
    showIncomplateDialog: false,
    showResponseDialog: false,

    isLoading: true,
    errorLoadingData: false,
    errorSendOrder: false,

    reangeWaktuJemput: [],
  };

  /** @type LocationStore */
  store = null;

  constructor(props) {
    super(props);
    this.store = this.props.store;
    this.loadingWaktuJemput();
  }

  getCurrentDateTime() {
    return this.date.getHours() >= 17
      ? new Date(new Date().setDate(this.date.getDate() + 1))
      : this.date;
  }

  loadingWaktuJemput() {
    this.setState({isLoading: true, errorLoadingData: false});
    RestApi.get('/wj/all')
      .then(res => {
        let tmp = res.data.value.map(data => {
          data.mulai = data.mulai.substr(0, 5);
          data.berakhir = data.berakhir.substr(0, 5);
          return data;
        });

        this.setState({
          reangeWaktuJemput: tmp,
          isLoading: false,
          errorLoadingData: false,
        });
        console.log('res', res);
      })
      .catch(err => {
        console.log('error res', err);
        this.setState({
          reangeWaktuJemput: [
            {label: 'Pagi', mulai: '07:00', berakhir: '10:00'},
            {label: 'Siang', mulai: '10:00', berakhir: '12:00'},
            {label: 'Sore', mulai: '14:00', berakhir: '17:00'},
          ],
          isLoading: false,
          errorLoadingData: true,
        });
      });
  }

  resetValue() {
    this.props.orderStore.setData([]);
    this.setState({
      waktuJemput: null,
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

  onChangeDateJemput = (event, selected) => {
    const {dateJemput} = this.state;
    const currentTime = this.getCurrentDateTime();
    const alternate = dateJemput >= currentTime ? dateJemput : currentTime;
    const current = selected ? selected : alternate;
    let date = selected ? current : alternate;
    date = date ? this.convertDate(date, '{Y}-{M}-{D}') : date;
    this.setState({showJemput: false, dateJemput: current, waktuJemput: date});
  };

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
      noHp,
      alamat,
      latitude,
      longitude,
      catatan,
      selectedRangeWaktu,
    } = this.state;
    if (
      waktuJemput &&
      noHp &&
      alamat &&
      latitude &&
      longitude &&
      catatan &&
      selectedRangeWaktu
    ) {
      return {
        barang: this.props.orderStore.getData,
        tglJemput: waktuJemput,
        waktuJemput: selectedRangeWaktu,
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
    //console.log('test order', JSON.stringify(this.getData()));
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
            errorSendOrder: false,
          });
          this.resetValue();
        })
        .catch(e => {
          console.log('error send order', e);
          this.setState({
            errorSendOrder: true,
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
      dateJemput,
      showJemput,
      modePickerJemput,
      noHp,
      catatan,
      waktuJemput,
      alamat,
    } = this.state;
    console.info('#render : ', this.constructor.name);

    return (
      <View style={{backgroundColor: '#fff', flexGrow: 1}}>
        <View
          style={{
            flexDirection: 'row',
            paddingVertical: 8,
            elevation: 4,
            backgroundColor: theme.colors.tabOrder,
          }}>
          <Button
            type={'clear'}
            onPress={() => this.props.navigation.goBack()}
            containerStyle={{justifyContent: 'center'}}
            icon={
              <MaterialCommunityIcons
                name={'arrow-left'}
                size={28}
                color={theme.colors.textToolBar}
              />
            }
          />
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
              paddingHorizontal: 15,
            }}>
            <Text
              style={[styles.textHeader, {color: theme.colors.textToolBar}]}>
              Info Pesanan
            </Text>
            <Text
              style={[
                styles.textSecondary,
                {color: theme.colors.textToolBar, marginTop: -3},
              ]}>
              Lengkapi data berikut
            </Text>
          </View>
        </View>

        <View style={{flex: 1, height: 100}}>
          <FlatContainer style={{paddingHorizontal: 25, paddingTop: 10}}>
            <View style={{marginVertical: 10}}>
              <Text style={styles.textLabel}>Waktu Jemput</Text>
              <Text style={styles.textSecondary}>
                ( Kapan laundry kamu mau dijemput? )
              </Text>
            </View>
            <DateTimePicker
              value={waktuJemput}
              onPress={() =>
                this.setState({showJemput: true, modePickerJemput: 'date'})
              }
              hint={'Tanggal'}
              label={null}
              icon={'calendar-outline'}
              iconColor={'orange'}
              textStyle={{color: '#000'}}
            />
            <View
              style={{
                borderBottomColor: '#fff',
                backgroundColor: 'rgba(0,0,0,0.04)',
                borderRadius: 15,
                paddingLeft: 5,
                marginRight: 0,
                marginTop: 5,
                marginBottom: 20,
              }}>
              <Picker
                mode={'dropdown'}
                selectedValue={this.state.selectedRangeWaktu}
                onValueChange={(itemValue, itemIndex) => {
                  const {berakhir} = itemValue;
                  this.setState({
                    selectedRangeWaktu:
                      parseInt(berakhir.substring(0, 2)) - 1 >=
                      this.date.getHours()
                        ? itemValue
                        : null,
                  });
                }}>
                <Picker.Item label={'Pilih Waktu'} value={null} />
                {this.state.reangeWaktuJemput.map(data => {
                  const availableTime =
                    parseInt(data.berakhir.substring(0, 2)) - 1 >=
                    this.date.getHours();
                  const availableDate = this.state.dateJemput > this.date;
                  return (
                    <Picker.Item
                      color={
                        availableTime || availableDate ? '#000' : '#c4c4c4'
                      }
                      label={`${data.label} (${data.mulai} - ${data.berakhir})`}
                      value={data}
                    />
                  );
                })}
              </Picker>
            </View>

            <View style={{flexDirection: 'row'}}>
              <Text style={styles.textLabel}>Nomor Ponsel</Text>
              <Text style={styles.textSecondary}> ( Aktif )</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                borderBottomColor: 'grey',
                borderBottomWidth: 1,
                marginBottom: 20,
              }}>
              <View style={{justifyContent: 'center'}}>
                <MaterialCommunityIcons
                  name={'phone'}
                  size={24}
                  color={'forestgreen'}
                />
              </View>
              <TextInputMask
                placeholder={'0812-xxxx-xxxx'}
                onChangeText={(formatted, extracted) => {
                  this.setState({noHp: extracted});
                }}
                defaultValue={noHp}
                keyboardType={'phone-pad'}
                style={{
                  flex: 1,
                  marginLeft: 7,
                  fontSize: 16,
                }}
                mask={'[0000]-[0000]-[000000]'}
              />
            </View>

            <Text style={styles.textLabel}>Alamat</Text>
            <TouchableHighlight
              underlayColor={'transparent'}
              style={{marginBottom: 20}}
              onPress={() => {
                this.props.navigation.navigate('MapsScreen');
              }}>
              <Input
                label={null}
                inputStyle={[styles.mp_lr_0, {fontSize: 13}]}
                multiline
                maxLength={250}
                containerStyle={[styles.mp_lr_0, styles.mp_l_0]}
                leftIconContainerStyle={styles.ml0_ph10}
                disabled
                leftIcon={
                  <MaterialCommunityIcons
                    name={'google-maps'}
                    size={24}
                    color={'mediumblue'}
                  />
                }
                value={
                  alamat
                    ? alamat
                    : 'Klik disini, tentukan titik alamat anda langsung dari google maps'
                }
              />
            </TouchableHighlight>
            <Input
              label={'Catatan'}
              placeholder={
                'misal: Perumahan A blok C26 Warna Hijau, silahkan ketik sesuai kebutuhan anda'
              }
              labelStyle={styles.fnt_14_secondary}
              inputStyle={[styles.mp_lr_0, {fontSize: 15}]}
              multiline
              maxLength={160}
              clearButtonMode={'always'}
              containerStyle={[styles.mp_lr_0, {marginBottom: 30}]}
              leftIconContainerStyle={styles.ml0_ph10}
              leftIcon={
                <MaterialCommunityIcons
                  name={'pencil'}
                  size={24}
                  color={'grey'}
                />
              }
              value={catatan}
              onChangeText={text => {
                this.setState({catatan: text});
              }}
            />

            {showJemput && (
              <RNDateTimePicker
                minimumDate={this.getCurrentDateTime()}
                timeZoneOffsetInMinutes={0}
                value={dateJemput}
                mode={modePickerJemput}
                is24Hour={true}
                display="default"
                onChange={this.onChangeDateJemput}
              />
            )}
            <Button
              type={'outline'}
              title={'Kirim Laundry'}
              titleStyle={{fontSize: 17, color: '#1dbc60'}}
              buttonStyle={{width: '100%', borderColor: '#1dbc60'}}
              containerStyle={{
                marginBottom: 20,
              }}
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
          </FlatContainer>
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
          dismissable={false}>
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
                if (!this.state.errorSendOrder) {
                  this.props.navigation.pop(3);
                }
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
