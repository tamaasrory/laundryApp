/**
 * @flow
 */
import React from 'react';
import FlatContainer from '../components/FlatContainer';
import styles from '../components/Styles';
import {Button, ListItem, Text} from 'react-native-elements';
import RestApi from '../router/Api';
import {StatusBar, View} from 'react-native';
import {theme} from '../core/theme';
import {inject, observer} from 'mobx-react';
import moment from '../components/DateFormater';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import {Colors} from 'react-native-paper';

@inject('orderStore')
@observer
class HistoryScreen extends React.PureComponent {
  screenHeight = 0;
  bs = React.createRef();
  state = {
    listData: [],

    selectedTransaksi: null,
    selectedKategori: null,

    bsMaxHeight: 0,
    bsMidHeight: 0,
    alertVisible: false,
    pesanDialog: 'Batalkan Order Laundry Sekarang ?',
    possitiveBtn: () => {},
    negativeBtn: () => {},
    batalID: null,
    openBs: false,

    isLoading: true,
    errorLoadingData: false,
  };

  constructor(props) {
    super(props);
    this.loadingData();
  }

  loadingData() {
    this.setState({isLoading: true, errorLoadingData: false});
    RestApi.get('/order/history')
      .then(res => {
        this.setState({
          listData: res.data.value,
          isLoading: false,
          errorLoadingData: false,
        });
        console.log('res', res);
      })
      .catch(err => {
        console.log('error res', err);
        this.setState({listData: [], isLoading: false, errorLoadingData: true});
      });
  }

  formatDiskon(diskon) {
    return parseFloat(diskon.toString().replace('%', ''));
  }

  diskonCounter(diskon, harga, jp) {
    const disc = this.formatDiskon(diskon);
    if (disc !== 0) {
      return harga * (disc / 100) * jp;
    }
    return 0;
  }

  total(selectedTransaksi, selectedKategori, jumlahPesanan, isMember) {
    let total = 0;
    let potongan = 0;
    if (selectedKategori) {
      let {diskon, harga, diskonStatus} = selectedKategori;
      const {detail} = selectedTransaksi;
      let jp = jumlahPesanan.toString().replace(',', '.') || 0;
      harga = parseFloat(harga);
      jp = parseFloat(jp);

      // diskon utama
      potongan += detail.diskonStatus
        ? this.diskonCounter(
            isMember ? detail.diskon.member : detail.diskon.general,
            harga,
            jp,
          )
        : 0;

      // diskon kategori
      potongan += diskonStatus
        ? this.diskonCounter(
            isMember ? diskon.member : diskon.general,
            harga,
            jp,
          )
        : 0;

      total = harga * jp - potongan;
    }
    return total;
  }

  getStatusLabel(key) {
    let status = ['Dalam Proses', 'Selesai', 'Dibatalkan'];
    return status[key];
  }

  getStatusColor(key) {
    let status = ['#009aff', Colors.green500, '#909090'];
    return status[key];
  }

  getStatusPembayaran(total, pembayaran) {
    total = parseFloat(total);
    pembayaran = parseFloat(pembayaran);
    console.log(pembayaran, total);
    if (pembayaran === total) {
      return 'Lunas';
    }
    if (pembayaran > 0) {
      return 'Lunas Sebagian';
    }
    return 'Belum Dibayar';
  }

  getStatusBayarColor(key) {
    return {
      Lunas: Colors.green500,
      'Lunas Sebagian': '#009aff',
      'Belum Dibayar': '#909090',
    }[key];
  }

  _renderShimmerList(numberRow) {
    let shimmerRows = [];
    for (let index = 0; index < numberRow; index++) {
      shimmerRows.push(
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: 15,
            paddingHorizontal: 15,
            borderBottomWidth: 0.5,
            borderBottomColor: '#ddd',
          }}>
          <View style={{alignSelf: 'center'}}>
            <ShimmerPlaceHolder
              autoRun={true}
              style={{
                width: '40%',
                height: 20,
                marginBottom: 7,
                borderRadius: 10,
              }}
            />
            <ShimmerPlaceHolder
              autoRun={true}
              style={{
                width: '65%',
                height: 15,
                borderRadius: 10,
              }}
            />
          </View>
          <ShimmerPlaceHolder
            autoRun={true}
            style={{
              width: '30%',
              height: 20,
              alignSelf: 'center',
              borderRadius: 10,
            }}
          />
        </View>,
      );
    }
    return <View style={{backgroundColor: '#fff'}}>{shimmerRows}</View>;
  }

  render() {
    console.info('#render : ', 'HistoryScreen.js');
    const {listData, errorLoadingData} = this.state;
    return (
      <View
        onLayout={event => {
          this.screenHeight = event.nativeEvent.layout.height;
        }}
        style={{flexGrow: 1}}>
        <StatusBar
          backgroundColor={theme.colors.tabHistoryStatusBar}
          barStyle={'light-content'}
        />
        <View
          style={{
            flexDirection: 'row',
            paddingVertical: 8,
            backgroundColor: theme.colors.tabHistory,
          }}>
          <Button
            type={'clear'}
            onPress={() => this.props.navigation.pop(1)}
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
              Riwayat Laundry
            </Text>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            height: 100,
          }}>
          <FlatContainer
            onRefresh={() => this.loadingData()}
            style={{marginBottom: 50}}>
            {this.state.isLoading ? (
              this._renderShimmerList(7)
            ) : listData.length === 0 ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  paddingHorizontal: 35,
                }}>
                <Text style={{textAlign: 'center', color: '#b9b9b9'}}>
                  {errorLoadingData
                    ? 'Sepertinya ada masalah jaringan, coba periksa jaringan atau paket data kamu'
                    : 'Sepertinya tidak ada barang yang sedang anda laundry, ayo laundry sekarang!'}
                </Text>
              </View>
            ) : (
              listData.map((list, i) => {
                let totalLaundry = 0;
                list.detail.barang.forEach(d => {
                  totalLaundry += this.total(
                    d,
                    d.selectedKategori,
                    d.jumlah,
                    parseInt(list.detail.isMember),
                  );
                });
                const tmpTotalLaundry = totalLaundry;
                totalLaundry = totalLaundry.toString().formatNumber();
                return (
                  <ListItem
                    key={i}
                    underlayColor={'rgba(0,0,0,0.14)'}
                    onPress={() =>
                      this.props.navigation.navigate('DetailOrderScreen', {
                        id: list.ido,
                      })
                    }
                    title={null}
                    // titleStyle={[styles.titleList, {fontSize: 13, color: 'grey'}]}
                    subtitle={
                      <View style={{flexDirection: 'column'}}>
                        <Text style={{fontSize: 12, color: 'grey'}}>
                          {list.ido}
                        </Text>
                        <Text style={{fontSize: 20}}>Rp{totalLaundry}</Text>
                      </View>
                    }
                    containerStyle={{paddingVertical: 15}}
                    subtitleStyle={styles.subtitleList}
                    leftElement={
                      <View style={{flexDirection: 'column'}}>
                        <Text
                          style={{
                            fontSize: 20,
                            fontWeight: 'bold',
                            color: Colors.green500,
                            textAlign: 'center',
                          }}>
                          {moment(list.created_at).format('DD')}
                        </Text>
                        <Text style={{fontSize: 11, textAlign: 'center'}}>
                          {moment(list.created_at).format('MM/YY')}
                        </Text>
                      </View>
                    }
                    rightElement={
                      <View style={{flexDirection: 'column'}}>
                        <Text
                          style={{
                            fontSize: 14,
                            color: '#fff',
                            alignSelf: 'flex-end',
                            paddingVertical: 2,
                            paddingHorizontal: 7,
                            borderRadius: 5,
                            backgroundColor: this.getStatusColor(list.status),
                          }}>
                          {this.getStatusLabel(list.status)}
                        </Text>
                        <Text
                          style={{
                            alignSelf: 'flex-end',
                            fontSize: 11,
                            color: Colors.grey600,
                            marginTop: 2,
                          }}>
                          {this.getStatusPembayaran(
                            tmpTotalLaundry,
                            list.pembayaran,
                          ).toUpperCase()}
                        </Text>
                      </View>
                    }
                    bottomDivider
                  />
                );
              })
            )}
          </FlatContainer>
        </View>
      </View>
    );
  }
}

export default HistoryScreen;
